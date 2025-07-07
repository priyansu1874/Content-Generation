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
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState('');
  const [hasGeneratedInThisSession, setHasGeneratedInThisSession] = useState(false);

  // Smart button logic
  const blogFormContext = useBlogForm();
  const { 
    hasGeneratedOnce, 
    hasFormDataChanged, 
    generatedPrompt,
    markAsGenerated,
    resetSession,
    isComingFromValidation,
    setComingFromValidation
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
  
  // Reset session state when coming from form (not from validation)
  useEffect(() => {
    if (!isComingFromValidation && resetSession) {
      resetSession();
      setHasGeneratedInThisSession(false);
    }
  }, [isComingFromValidation, resetSession]);
  
  // Initialize state if we have existing content and we're coming from validation
  useEffect(() => {
    if (formData?.webhookResponse?.trim() && finalPrompt.trim() && isComingFromValidation) {
      setHasGeneratedInThisSession(true);
      setLastGeneratedPrompt(finalPrompt.trim());
    }
  }, [formData?.webhookResponse, finalPrompt, isComingFromValidation]);

  // Generate Button Logic - disabled when prompt is empty OR content was already generated with current prompt
  const isGenerateEnabled = () => {
    // Always disable if generating
    if (isGenerating) return false;
    
    // Always enable if there's a prompt (simplified logic)
    return finalPrompt.trim().length > 0;
  };

  // Next Page Button Logic - disabled when no content has been generated in current session
  const isNextEnabled = () => {
    return hasGeneratedInThisSession;
  };

  const getGenerateButtonStatus = () => {
    if (!finalPrompt.trim()) return "Please enter a prompt";
    if (isGenerating) return "Generating content...";
    
    if (!hasGeneratedInThisSession) {
      return "Ready to generate content";
    }
    
    const promptChanged = finalPrompt !== lastGeneratedPrompt;
    if (promptChanged) {
      return "Prompt changed - ready to generate content";
    } else {
      return "Content already generated with current prompt - change prompt to regenerate";
    }
  };

  const getNextButtonStatus = () => {
    if (!hasGeneratedInThisSession) {
      return "Generate content first to proceed to next page";
    }
    return "Proceed to next page";
  };

  const handleSubmit = async () => {
    if (!finalPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    
    try {
      const res = await fetch('https://priyansu4781.app.n8n.cloud/webhook/83037732-608c-4f27-9b81-04c49daae6d9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, finalPrompt }),
      });
      const data = await res.text();
      
      // Update button states according to documentation
      if (typeof markAsGenerated === 'function') {
        markAsGenerated(finalPrompt, formData);
      }
      setHasGeneratedInThisSession(true);
      setLastGeneratedPrompt(finalPrompt);
      
      // Update the blog form context with the generated data
      const finalData = { ...formData, finalPrompt, webhookResponse: data };
      if (blogFormContext?.setFormData) {
        blogFormContext.setFormData(finalData);
      }
      
      onSubmitForApproval?.(data);
      
    } catch {
      const errorData = { ...formData, finalPrompt, webhookResponse: 'Error: Failed to get response from webhook.' };
      if (blogFormContext?.setFormData) {
        blogFormContext.setFormData(errorData);
      }
      setFinalPrompt('Error: Failed to get response from webhook.');
      // Update state even on error
      setHasGeneratedInThisSession(true);
      setLastGeneratedPrompt(finalPrompt);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle next button click
  const handleNextClick = () => {
    if (!isNextEnabled() || !onNext) return;
    // Mark that we're going to validation to preserve session state
    if (setComingFromValidation) {
      setComingFromValidation(true);
    }
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
