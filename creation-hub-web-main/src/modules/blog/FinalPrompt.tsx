import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { ArrowLeft, FileText } from 'lucide-react';
import { useBlogForm } from './BlogFormContext';

interface FinalPromptProps {
  onBack: () => void;
  onSubmitForApproval: (prompt: string) => void;
  formData?: any;
  systemPrompt?: string;
  onNext?: () => void;
}

const FinalPrompt: React.FC<FinalPromptProps> = ({
  onBack,
  onSubmitForApproval,
  formData,
  systemPrompt = '',
  onNext,
}) => {
  const [finalPrompt, setFinalPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedPromptText, setLastGeneratedPromptText] = useState(''); // Track last generated prompt
  const [hasClickedGenerate, setHasClickedGenerate] = useState(false); // Track if generate was clicked

  // Smart button logic
  const blogFormContext = useBlogForm();
  const { 
    hasGeneratedOnce, 
    hasFormDataChanged, 
    lastGeneratedPrompt,
    generatedPrompt,
    markAsGenerated
  } = blogFormContext || {};

  useEffect(() => {
    if (formData?.webhookResponse) {
      let cleaned = formData.webhookResponse;
      let bodyText = '';

      try {
        const parsed = JSON.parse(cleaned);

        if (typeof parsed === 'object' && parsed !== null) {
          // Extract main prompt
          if (parsed.output) {
            cleaned = parsed.output;
          } else if (parsed.prompt) {
            cleaned = parsed.prompt;
          } else {
            cleaned = Object.values(parsed)
              .filter(val => typeof val === 'string')
              .join('\n');
          }

          // If body exists, append its stringified content as readable text
          if (parsed.body && typeof parsed.body === 'object') {
            bodyText =
              '\n\n---\n\nForm Data:\n' +
              Object.entries(parsed.body)
                .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                .join('\n');
          }
        }
      } catch {
        // If not JSON, use as is
      }

      // Replace all \n with real line breaks for display
      cleaned = cleaned.replace(/\\n/g, '\n');
      setFinalPrompt(cleaned + bodyText);
    }
  }, [formData]);
  
  // Initialize state if we have existing content
  useEffect(() => {
    if (formData?.webhookResponse?.trim() && finalPrompt.trim() && !hasClickedGenerate) {
      console.log('Setting hasClickedGenerate due to existing webhookResponse');
      setHasClickedGenerate(true);
      setLastGeneratedPromptText(finalPrompt.trim());
    }
  }, [formData?.webhookResponse, finalPrompt, hasClickedGenerate]);

  // Run once on component mount to initialize correctly
  useEffect(() => {
    console.log('FinalPrompt component mounted');
    // If there's no webhook response, make sure the button is enabled
    if (!formData?.webhookResponse) {
      setHasClickedGenerate(false);
      setLastGeneratedPromptText('');
      console.log('Reset button state on initial mount');
    }
  }, []);

  // Reset hasClickedGenerate when webhook response changes
  useEffect(() => {
    // If there's no webhookResponse, we know this is the first time 
    // the user is navigating to this page or after form data changes
    if (!formData?.webhookResponse) {
      setHasClickedGenerate(false);
      setLastGeneratedPromptText('');
      console.log('Reset generate button state due to no webhookResponse');
    }
  }, [formData?.webhookResponse]);

  // Debug log when component mounts or formData changes
  useEffect(() => {
    console.log('FinalPrompt - formData:', formData);
    console.log('FinalPrompt - hasClickedGenerate:', hasClickedGenerate);
    console.log('FinalPrompt - lastGeneratedPromptText:', lastGeneratedPromptText);
    console.log('FinalPrompt - webhookResponse exists:', !!formData?.webhookResponse);
    console.log('FinalPrompt - isGenerateEnabled:', isGenerateEnabled());
  }, [formData, hasClickedGenerate, lastGeneratedPromptText]);

  // Smart button logic functions
  const isGenerateEnabled = () => {
    // Always disable if generating or no prompt text
    if (!finalPrompt.trim() || isGenerating) return false;
    
    // First time navigation - ALWAYS enable the button
    // This ensures the button is enabled when first arriving at the page
    if (!hasClickedGenerate) return true;
    
    // After generation, only enable if prompt has changed
    const promptChanged = finalPrompt.trim() !== lastGeneratedPromptText.trim();
    return promptChanged;
  };

  // Smart button logic for Next Page button  
  const isNextEnabled = () => {
    // Enable Next if we have clicked generate and have content
    return hasClickedGenerate && formData?.webhookResponse?.trim();
  };

  const getGenerateButtonStatus = () => {
    if (!finalPrompt.trim()) return "Please enter a prompt";
    if (isGenerating) return "Generating content...";
    
    if (!hasClickedGenerate) {
      return "Ready to generate content";
    }
    
    const promptChanged = finalPrompt.trim() !== lastGeneratedPromptText.trim();
    if (promptChanged) {
      return "Prompt changed - ready to generate content";
    } else {
      return "Content already generated with current prompt - change prompt to regenerate";
    }
  };

  const getNextButtonStatus = () => {
    if (!hasClickedGenerate) return "Generate content first";
    if (!formData?.webhookResponse?.trim()) return "No content generated yet";
    return "Ready to preview content";
  };

  const handleSubmit = async () => {
    if (!isGenerateEnabled()) return;

    setIsGenerating(true);
    setHasClickedGenerate(true); // Mark that generate was clicked
    console.log('Generate button clicked, hasClickedGenerate set to true');
    
    try {
      const res = await fetch('https://priyansu4781.app.n8n.cloud/webhook/83037732-608c-4f27-9b81-04c49daae6d9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, finalPrompt }),
      });
      const data = await res.text();
      
      // Update the blog form context with the generated data
      const finalData = { ...formData, finalPrompt, webhookResponse: data };
      if (blogFormContext?.setFormData) {
        blogFormContext.setFormData(finalData);
        console.log('Updated form data with webhook response');
      }
      
      // Mark as generated for smart button logic
      if (typeof markAsGenerated === 'function') {
        markAsGenerated(finalPrompt, formData);
        console.log('Marked as generated in context');
      }
      
      // Save the prompt text that was used for generation
      setLastGeneratedPromptText(finalPrompt.trim());
      console.log('Last generated prompt text updated:', finalPrompt.trim());
      
      onSubmitForApproval?.(data);
      
      // Don't automatically navigate - let user click Next Page button
      
    } catch (error) {
      console.error('Error generating content:', error);
      const errorData = { ...formData, finalPrompt, webhookResponse: 'Error: Failed to get response from webhook.' };
      if (blogFormContext?.setFormData) {
        blogFormContext.setFormData(errorData);
      }
      setFinalPrompt('Error: Failed to get response from webhook.');
      // Save the prompt text even on error
      setLastGeneratedPromptText(finalPrompt.trim());
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle next button click
  const handleNextClick = () => {
    if (!isNextEnabled() || !onNext) return;
    onNext();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Final Prompt Review</h1>
          <p className="text-lg text-gray-600">Review and edit the final prompt for AI generation</p>
        </div>

        {/* Final Prompt Editor */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              Final Prompt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="finalPrompt" className="text-sm font-medium text-gray-700">
                Edit the prompt that will be sent to the AI generator
              </Label>
              <Textarea
                id="finalPrompt"
                className="border border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 min-h-[400px] font-mono text-sm rounded-md bg-white p-3"
                style={{ whiteSpace: 'pre-wrap' }}
                value={finalPrompt}
                onChange={e => {
                  setFinalPrompt(e.target.value);
                  // Update the context to ensure sync
                  if (blogFormContext?.formData && blogFormContext?.setFormData) {
                    blogFormContext.setFormData({ ...blogFormContext.formData, finalPrompt: e.target.value });
                  }
                }}
                spellCheck={true}
              />
            </div>

            <div className="pt-4">
              {hasClickedGenerate && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 shadow-sm mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">Generate Status:</div>
                      <div className={`text-sm font-medium ${
                        finalPrompt.trim() !== lastGeneratedPromptText.trim()
                          ? "text-orange-600" 
                          : formData?.webhookResponse?.trim()
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}>
                        {formData?.webhookResponse?.trim()
                          ? "Content generated" 
                          : finalPrompt.trim() !== lastGeneratedPromptText.trim()
                          ? "Ready to generate content"
                          : "Ready to generate content"
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">Next Step:</div>
                      <div className="text-sm text-gray-600">
                        {formData?.webhookResponse?.trim()
                          ? "Review and approve the generated content"
                          : finalPrompt.trim() !== lastGeneratedPromptText.trim()
                          ? "Generate new content with updated prompt"
                          : "Change prompt to generate new content"
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-4 justify-between">
                <Button onClick={onBack} variant="outline" className="border-gray-300 hover:bg-gray-50 px-6 py-3" size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Form
                </Button>
                <div className="flex gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={!isGenerateEnabled()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                    title={getGenerateButtonStatus()}
                  >
                    {isGenerating ? "Generating..." : "Generate Content"}
                  </Button>
                  {onNext && (
                    <Button
                      onClick={handleNextClick}
                      disabled={!isNextEnabled()}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      size="lg"
                      title={getNextButtonStatus()}
                    >
                      Next Page →
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinalPrompt;
