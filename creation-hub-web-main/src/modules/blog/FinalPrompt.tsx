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
  const [originalPrompt, setOriginalPrompt] = useState(''); // Track the original prompt
  const [isComingFromGenerateBlog, setIsComingFromGenerateBlog] = useState(false); // Track navigation source
  const [isInitialized, setIsInitialized] = useState(false); // Prevent state overwrites

  // Smart button logic
  const blogFormContext = useBlogForm();
  const { 
    hasGeneratedOnce, 
    hasFormDataChanged, 
    generatedPrompt,
    markAsGenerated,
    resetSession,
    isComingFromValidation,
    setComingFromValidation,
    formData: contextFormData,
    setFormData: setContextFormData
  } = blogFormContext || {};

  // Initialize prompt from context or webhook response - SINGLE POINT OF TRUTH
  useEffect(() => {
    if (isInitialized) return; // Prevent re-initialization
    
    console.log('🚀 FinalPrompt Initialization - SINGLE RUN:', {
      hasContextPrompt: !!contextFormData?.finalPrompt,
      hasWebhookResponse: !!formData?.webhookResponse,
      isComingFromValidation: !!isComingFromValidation,
      webhookResponseLength: formData?.webhookResponse?.length || 0
    });

    // ROUTE 1: Coming from Generate Blog button (context has finalPrompt)
    if (contextFormData?.finalPrompt) {
      console.log('✅ ROUTE 1: Coming from Generate Blog - context prompt exists');
      setFinalPrompt(contextFormData.finalPrompt);
      setOriginalPrompt(contextFormData.finalPrompt);
      setIsComingFromGenerateBlog(true);
      setHasGeneratedInThisSession(false); // NOT generated in FinalPrompt yet
      
      // If there's also a webhook response, it means we're returning from validation
      if (formData?.webhookResponse && isComingFromValidation) {
        setLastGeneratedPrompt(contextFormData.finalPrompt);
        setHasGeneratedInThisSession(true); // Restore session state
        setIsComingFromGenerateBlog(false); // NOT coming from Generate Blog when returning from validation
        console.log('🔄 Restoring from validation with existing generation');
      }
      
    } 
    // ROUTE 2: Direct webhook response (no context prompt) - this means first arrival with webhook
    else if (formData?.webhookResponse) {
      console.log('🟠 ROUTE 2: Direct webhook response - first arrival, treating as Generate Blog route');
      
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
        console.log('Webhook response is not JSON, using as-is');
      }

      cleaned = cleaned.replace(/\\n/g, '\n');
      const newPrompt = cleaned + bodyText;
      
      setFinalPrompt(newPrompt);
      setOriginalPrompt(newPrompt);
      setLastGeneratedPrompt(''); // No last generated yet
      setIsComingFromGenerateBlog(true); // Treat as coming from Generate Blog
      setHasGeneratedInThisSession(false); // NOT generated in FinalPrompt yet
      
      // Store in context for persistence
      if (setContextFormData && contextFormData) {
        setContextFormData({ ...contextFormData, finalPrompt: newPrompt });
      }
    } 
    // ROUTE 3: Fresh start
    else {
      console.log('🆕 ROUTE 3: Fresh start - no existing data');
      setIsComingFromGenerateBlog(true); // Assume from Generate Blog
      setHasGeneratedInThisSession(false);
    }
    
    setIsInitialized(true); // Mark as initialized to prevent re-runs
    console.log('✅ Initialization complete');
    
  }, [formData, contextFormData, isComingFromValidation]); // Only run when these change

  // Generate Button Logic - CLEAR PRIORITY SYSTEM
  const isGenerateEnabled = () => {
    if (!finalPrompt.trim()) return false;
    if (isGenerating) return false;
    
    const promptChanged = finalPrompt !== lastGeneratedPrompt;
    const promptModifiedFromOriginal = finalPrompt !== originalPrompt;
    
    console.log('🔍 BUTTON LOGIC DEBUG:', {
      hasPrompt: !!finalPrompt.trim(),
      isGenerating,
      hasGeneratedInThisSession,
      promptChanged,
      promptModifiedFromOriginal,
      isComingFromGenerateBlog,
      isComingFromValidation: !!isComingFromValidation,
      finalPromptLength: finalPrompt.length,
      lastGeneratedPromptLength: lastGeneratedPrompt.length,
      originalPromptLength: originalPrompt.length,
      willEnable: 'calculating...'
    });
    
    // PRIORITY 1: If coming from validation, disable until prompt changes
    if (isComingFromValidation && !promptChanged) {
      console.log('🔒 PRIORITY 1: Coming from validation - DISABLING until prompt changes');
      return false;
    }
    
    // PRIORITY 2: If coming from Generate Blog button, always enable (first time in FinalPrompt)
    if (isComingFromGenerateBlog) {
      console.log('✅ PRIORITY 2: Coming from Generate Blog - ENABLING');
      return true;
    }
    
    // PRIORITY 3: If generated in THIS session, only enable if prompt changed
    if (hasGeneratedInThisSession) {
      console.log('🔄 PRIORITY 3: Generated in session - enable only if changed:', promptChanged);
      return promptChanged;
    }
    
    // PRIORITY 4: Direct webhook route - enable only if modified from original
    if (lastGeneratedPrompt && !isComingFromGenerateBlog) {
      console.log('🟠 PRIORITY 4: Direct webhook - enable if modified:', promptModifiedFromOriginal);
      return promptModifiedFromOriginal;
    }
    
    // PRIORITY 5: Default - enable
    console.log('✅ PRIORITY 5: Default case - ENABLING');
    return true;
  };

  // Next Page Button Logic - disabled when no content has been generated in current session
  const isNextEnabled = () => {
    if (!hasGeneratedInThisSession) return false;
    // Also check if prompt hasn't changed since last generation
    return finalPrompt === lastGeneratedPrompt;
  };

  const getGenerateButtonStatus = () => {
    if (!finalPrompt.trim()) return "Please enter a prompt";
    if (isGenerating) return "Generating content...";
    
    const promptChanged = finalPrompt !== lastGeneratedPrompt;
    const promptModifiedFromOriginal = finalPrompt !== originalPrompt;
    
    // PRIORITY 1: Coming from validation
    if (isComingFromValidation && !promptChanged) {
      return "Content already generated - change prompt to regenerate";
    }
    
    // PRIORITY 2: Coming from Generate Blog
    if (isComingFromGenerateBlog) {
      return "Ready to generate content from form";
    }
    
    // PRIORITY 3: Generated in this session
    if (hasGeneratedInThisSession) {
      if (!promptChanged) {
        return "Content already generated - change prompt to regenerate";
      } else {
        return "Prompt changed - ready to generate new content";
      }
    }
    
    // PRIORITY 4: Direct webhook route
    if (lastGeneratedPrompt && !isComingFromGenerateBlog) {
      if (!promptModifiedFromOriginal) {
        return "Content already exists - modify prompt to generate new content";
      } else {
        return "Prompt modified - ready to generate content";
      }
    }
    
    // Default
    return "Ready to generate content";
  };

  const getNextButtonStatus = () => {
    if (!hasGeneratedInThisSession) {
      return "Generate content first to proceed to next page";
    }
    if (finalPrompt !== lastGeneratedPrompt) {
      return "Generate new content first (prompt changed)";
    }
    return "Proceed to next page";
  };

  const handleSubmit = async () => {
    if (!finalPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    
    try {
      const res = await fetch('https://priyansu4781.app.n8n.cloud/webhook-test/83037732-608c-4f27-9b81-04c49daae6d9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, finalPrompt }),
      });
      const data = await res.text();
      
      // Update button states after successful generation
      if (typeof markAsGenerated === 'function') {
        markAsGenerated(finalPrompt, { ...formData, finalPrompt });
      }
      setHasGeneratedInThisSession(true);
      setLastGeneratedPrompt(finalPrompt);
      setIsComingFromGenerateBlog(false); // Reset flag after generation
      
      // Clear coming from validation flag since we've generated new content
      if (setComingFromValidation) {
        setComingFromValidation(false);
      }
      
      // Update both local formData and context with the generated data
      const finalData = { ...formData, finalPrompt, webhookResponse: data };
      if (setContextFormData) {
        setContextFormData(finalData);
      }
      
      onSubmitForApproval?.(data);
      
    } catch {
      const errorData = { ...formData, finalPrompt, webhookResponse: 'Error: Failed to get response from webhook.' };
      if (setContextFormData) {
        setContextFormData(errorData);
      }
      setFinalPrompt('Error: Failed to get response from webhook.');
      // Update state even on error
      setHasGeneratedInThisSession(true);
      setLastGeneratedPrompt(finalPrompt);
      setIsComingFromGenerateBlog(false); // Reset flag after generation attempt
      
      // Clear coming from validation flag even on error
      if (setComingFromValidation) {
        setComingFromValidation(false);
      }
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
