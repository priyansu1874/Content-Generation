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
  // Simplified state management - like LinkedIn
  const [finalPrompt, setFinalPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Smart button logic
  const blogFormContext = useBlogForm();
  const { 
    hasGeneratedOnce, 
    hasFormDataChanged, 
    lastGeneratedPrompt,
    markAsGenerated,
    isComingFromValidation,
    setComingFromValidation,
    formData: contextFormData,
    setFormData: setContextFormData,
    currentStep,
    navigateToStep
  } = blogFormContext || {};

  // Simple initialization - like LinkedIn
  useEffect(() => {
    if (isInitialized) return;
    
    // Initialize prompt from context or webhook response
    if (contextFormData?.finalPrompt) {
      setFinalPrompt(contextFormData.finalPrompt);
    } else if (formData?.webhookResponse) {
      // Process webhook response like before
      let cleaned = formData.webhookResponse;
      let bodyText = '';

      try {
        const parsed = JSON.parse(cleaned);
        if (typeof parsed === 'object' && parsed !== null) {
          if (parsed.output) {
            cleaned = parsed.output;
          } else if (parsed.prompt) {
            cleaned = parsed.prompt;
          } else {
            cleaned = Object.values(parsed)
              .filter(val => typeof val === 'string')
              .join('\n');
          }

          if (parsed.body && typeof parsed.body === 'object') {
            bodyText =
              '\n\n---\n\nForm Data:\n' +
              Object.entries(parsed.body)
                .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                .join('\n');
          }
        }
      } catch {
        // Not JSON, use as-is
      }

      cleaned = cleaned.replace(/\\n/g, '\n');
      const newPrompt = cleaned + bodyText;
      setFinalPrompt(newPrompt);
      
      // Store in context
      if (setContextFormData && contextFormData) {
        setContextFormData({ ...contextFormData, finalPrompt: newPrompt });
      }
    }
    
    setIsInitialized(true);
  }, [formData, contextFormData, isInitialized, setContextFormData]);

  // Simple button logic - like LinkedIn
  const isGenerateEnabled = () => {
    if (!finalPrompt.trim() || isGenerating) return false;
    
    // If we haven't generated before, enable if we have a prompt
    if (!hasGeneratedOnce) return true;
    
    // If coming from validation, only enable if prompt changed
    if (isComingFromValidation) {
      return finalPrompt.trim() !== lastGeneratedPrompt.trim();
    }
    
    // If form data changed or prompt changed, enable
    return hasFormDataChanged() || finalPrompt.trim() !== lastGeneratedPrompt.trim();
  };

  // Simple Next button logic - like LinkedIn
  const isNextEnabled = () => {
    // Must have generated content and not have pending changes
    if (!hasGeneratedOnce || !contextFormData?.webhookResponse) return false;
    if (hasFormDataChanged()) return false;
    return true;
  };

  const getGenerateButtonStatus = () => {
    if (!finalPrompt.trim()) return "Please enter a prompt";
    if (isGenerating) return "Generating content...";
    
    if (hasGeneratedOnce) {
      if (isComingFromValidation && finalPrompt.trim() === lastGeneratedPrompt.trim()) {
        return "Content already generated - change prompt to regenerate";
      }
      if (hasFormDataChanged()) {
        return "Form inputs changed - ready to generate new content";
      }
      if (finalPrompt.trim() !== lastGeneratedPrompt.trim()) {
        return "Prompt changed - ready to generate new content";
      }
      return "Content already generated - change prompt to regenerate";
    }
    
    return "Ready to generate content";
  };

  const getNextButtonStatus = () => {
    if (!hasGeneratedOnce) return "Generate content first";
    if (!contextFormData?.webhookResponse) return "No content generated yet";
    if (hasFormDataChanged()) return "Generate new content first (inputs changed)";
    return "Ready to proceed to validation";
  };

  // Simplified submission handler - like LinkedIn
  const handleSubmit = async () => {
    if (!isGenerateEnabled()) return;

    setIsGenerating(true);
    
    try {
      const res = await fetch('https://devilblack.app.n8n.cloud/webhook/blog-content-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, finalPrompt }),
      });
      const data = await res.text();
      
      // Update context with generated data
      const finalData = { ...formData, finalPrompt, webhookResponse: data };
      if (setContextFormData) {
        setContextFormData(finalData);
      }
      
      // Mark as generated for smart button logic
      if (markAsGenerated) {
        markAsGenerated(finalPrompt, finalData);
      }
      
      // Clear coming from validation flag
      if (setComingFromValidation) {
        setComingFromValidation(false);
      }
      
      onSubmitForApproval?.(data);
      
    } catch {
      const errorData = { ...formData, finalPrompt, webhookResponse: 'Error: Failed to get response from webhook.' };
      if (setContextFormData) {
        setContextFormData(errorData);
      }
      
      // Mark as generated even on error
      if (markAsGenerated) {
        markAsGenerated(finalPrompt, errorData);
      }
      
      alert('Error generating content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Simplified next button handler - like LinkedIn
  const handleNextClick = () => {
    if (!isNextEnabled() || !onNext) return;
    
    // Use context navigation helper
    if (navigateToStep) {
      navigateToStep('validation');
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
                  const newPrompt = e.target.value;
                  setFinalPrompt(newPrompt);
                  // Always update the context to persist changes
                  if (setContextFormData && contextFormData) {
                    setContextFormData({ ...contextFormData, finalPrompt: newPrompt });
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
