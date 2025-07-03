import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowLeft, Wand2, ArrowRight, CheckCircle } from 'lucide-react';
import { ArticleFormData } from './InputDetailsForm';
import { useArticleContext } from './contexts/ArticleContext';

interface PromptPreviewProps {
  formData: ArticleFormData;
  onPromptGenerated: (prompt: string) => void;
  onArticleGenerated: (article: string) => void;
  onBack: () => void;
  existingGeneratedArticle?: string; // Add this prop to pass existing article
}

const PromptPreview: React.FC<PromptPreviewProps> = ({ 
  formData, 
  onPromptGenerated, 
  onArticleGenerated, 
  onBack,
  existingGeneratedArticle
}) => {
  // Helper to recursively extract only values from JSON or show plain text (no keys, no HTML)
  function extractValuesFromResponse(response: string): string {
    function flattenValues(obj: unknown): string[] {
      if (Array.isArray(obj)) {
        return obj.flatMap(flattenValues);
      } else if (obj && typeof obj === 'object') {
        return Object.values(obj as Record<string, unknown>).flatMap(flattenValues);
      } else if (obj !== undefined && obj !== null) {
        return [String(obj)];
      } else {
        return [];
      }
    }
    try {
      const obj = JSON.parse(response);
      return flattenValues(obj).join('\n');
    } catch {
      return response;
    }
  }

  const [editablePrompt, setEditablePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  // Store the last manually edited prompt in state
  const [userEditedPrompt, setUserEditedPrompt] = useState<string | null>(null);

  // Get context for smart button logic
  const { 
    state, 
    setPrompt, 
    markAsGenerated, 
    setComingFromValidation,
    isFormDataSameAsGenerated
  } = useArticleContext();

  // Smart button logic
  const isGenerateDisabled = () => {
    // If coming from validation page, Generate should be disabled
    if (state.isComingFromValidation) {
      return true;
    }
    
    // If content has been generated in this session and both prompt and form data haven't changed
    if (state.hasGeneratedInThisSession && 
        editablePrompt === state.lastGeneratedPrompt &&
        isFormDataSameAsGenerated(formData)) {
      return true;
    }
    
    // If prompt is empty
    if (!editablePrompt.trim()) {
      return true;
    }
    
    return false;
  };

  const isNextPageDisabled = () => {
    // If we have existing generated article (when coming back from Page 3), enable Next Page
    if (existingGeneratedArticle && existingGeneratedArticle.trim()) {
      return false;
    }
    
    // If no content has been generated yet and no content exists in context
    if (!state.hasGeneratedOnce && !state.generatedContent) {
      return true;
    }
    
    // If coming from validation, we definitely have content, so Next Page should be enabled
    if (state.isComingFromValidation) {
      return false;
    }
    
    // If content has been generated in this session, enable Next Page
    if (state.hasGeneratedInThisSession && state.generatedContent) {
      return false;
    }
    
    return true;
  };

  const generatePrompt = () => {
    const prompt = `Write a professional and expert-level technical article for ${formData.organizationName} targeting ${formData.targetAudience.join(', ')}. The focus is on ${formData.technologyFocus} and the main objective is: ${formData.articleObjective}. Keep the tone ${formData.toneOfArticle}. ${formData.keywords.length > 0 ? `Use these keywords: ${formData.keywords.join(', ')}.` : ''} ${formData.exampleReferences ? `Use these references if needed: ${formData.exampleReferences}.` : ''} Title: "${formData.articleTitle}". ${formData.authorName ? `Author: ${formData.authorName}.` : `Author: ${formData.organizationName} Team.`}

Please structure the article with:
1. An engaging introduction that hooks the reader
2. Clear main sections with subheadings
3. Technical depth appropriate for the target audience
4. Practical examples or use cases
5. A compelling conclusion with key takeaways
6. Use markdown formatting for better readability

The article should be comprehensive, informative, and showcase expertise in ${formData.technologyFocus}.`;

    return prompt;
  };

  useEffect(() => {
    // If the webhook response changes, only update the textarea if the user hasn't manually edited it
    if (formData.webhookResponse) {
      const valuesOnly = extractValuesFromResponse(formData.webhookResponse);
      if (!userEditedPrompt && valuesOnly !== editablePrompt) {
        setEditablePrompt(valuesOnly);
        setPrompt(valuesOnly);
        onPromptGenerated(valuesOnly);
      }
    } else if (!formData.webhookResponse && editablePrompt === '') {
      const prompt = generatePrompt();
      setEditablePrompt(prompt);
      setPrompt(prompt);
      onPromptGenerated(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.webhookResponse]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('PromptPreview State Debug:', {
      hasGeneratedOnce: state.hasGeneratedOnce,
      hasGeneratedInThisSession: state.hasGeneratedInThisSession,
      isComingFromValidation: state.isComingFromValidation,
      hasGeneratedContent: !!state.generatedContent,
      generatedContentLength: state.generatedContent?.length || 0,
      existingGeneratedArticleLength: existingGeneratedArticle?.length || 0,
      hasExistingArticle: !!existingGeneratedArticle,
      currentPrompt: state.currentPrompt,
      lastGeneratedPrompt: state.lastGeneratedPrompt,
      promptMatches: editablePrompt === state.lastGeneratedPrompt,
      formDataMatches: isFormDataSameAsGenerated(formData),
      nextPageDisabled: isNextPageDisabled(),
      generateDisabled: isGenerateDisabled()
    });
  }, [state, editablePrompt, existingGeneratedArticle, formData, isFormDataSameAsGenerated]);

  // When the user types in the textarea, store their edit and update context
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setEditablePrompt(newPrompt);
    setUserEditedPrompt(newPrompt);
    setPrompt(newPrompt);
  };

  // When the user navigates back to the first page, clear the user edit and reset coming from validation
  const handleBack = () => {
    setUserEditedPrompt(null);
    setComingFromValidation(false);
    onBack();
  };

  // Navigate to next page without generating new content
  const handleNextPage = () => {
    // Use existing generated article if available, otherwise use context content
    const contentToUse = existingGeneratedArticle || state.generatedContent;
    if (contentToUse) {
      onArticleGenerated(contentToUse);
    }
  };

  const handleGenerateArticle = async () => {
    setIsGenerating(true);
    try {
      // Prepare FormData for webhook (send all fields and values till Prompt Preview step)
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'uploadedImages' && Array.isArray(value)) {
          if (value.length > 0) {
            value.forEach((file: File) => data.append('uploadedImages', file));
          } else {
            data.append('uploadedImages', '');
          }
        } else if (key === 'technologyFocus') {
          // Send as array (split by comma, trim, filter empty)
          const techArr = String(value).split(',').map(s => s.trim()).filter(Boolean);
          data.append('technologyFocus', JSON.stringify(techArr));
        } else if (key === 'keywords') {
          // Send as array
          data.append('keywords', JSON.stringify(Array.isArray(value) ? value : String(value).split(',').map(s => s.trim()).filter(Boolean)));
        } else if (key === 'targetAudience') {
          // Send as array
          data.append('targetAudience', JSON.stringify(Array.isArray(value) ? value : String(value).split(',').map(s => s.trim()).filter(Boolean)));
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            value.forEach((item, i) => data.append(`${key}[${i}]`, item));
          } else {
            data.append(key, '');
          }
        } else if (value !== undefined && value !== null) {
          data.append(key, String(value));
        } else {
          data.append(key, '');
        }
      });
      // Add the current prompt
      data.append('prompt', editablePrompt);
      
      const response = await fetch('https://mobiosolutions.app.n8n.cloud/webhook/content-generate', {
        method: 'POST',
        body: data
      });
      const result = await response.text();
      const valuesOnly = extractValuesFromResponse(result);
      
      // Mark as generated and update state
      markAsGenerated(editablePrompt, formData);
      setEditablePrompt(valuesOnly); // Set only the value part in the textarea
      onArticleGenerated(valuesOnly);
    } catch (err) {
      alert('Failed to send data to content generation webhook');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Form Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">{formData.organizationName}</Badge>
            Article Configuration Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">Title:</span> {formData.articleTitle}</div>
            <div><span className="font-medium">Focus:</span> {formData.technologyFocus}</div>
            <div><span className="font-medium">Audience:</span> {formData.targetAudience.join(', ')}</div>
            <div><span className="font-medium">Tone:</span> {formData.toneOfArticle}</div>
            {formData.keywords.length > 0 && (
              <div className="md:col-span-2">
                <span className="font-medium">Keywords:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.keywords.map(keyword => (
                    <Badge key={keyword} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Editable Prompt */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardTitle className="text-xl">AI Prompt Preview</CardTitle>
          <p className="text-purple-100">Review and edit the prompt that will be sent to generate your article</p>
          
          {/* Status Indicator */}
          {(state.isComingFromValidation || state.hasGeneratedInThisSession) && (
            <div className="mt-3 p-3 bg-purple-400/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4" />
                {state.isComingFromValidation ? (
                  <span>Returning from validation - content already generated with current prompt</span>
                ) : state.hasGeneratedInThisSession && 
                     editablePrompt === state.lastGeneratedPrompt && 
                     isFormDataSameAsGenerated(formData) ? (
                  <span>Content generated with this prompt and form data - edit prompt or form to enable regeneration</span>
                ) : (
                  <span>Prompt or form data has been modified - generation enabled</span>
                )}
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <Textarea style={{ height:'472 px' }}
            value={editablePrompt}
            onChange={handlePromptChange}
            className="min-h-[300px] font-mono text-sm bg-slate-50 border-2"
            placeholder="AI prompt will appear here..."
          />
          <div className="flex justify-between items-center mt-6">
            <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Form
            </Button>
            
            <div className="flex justify-center flex-1 mx-6">
              <Button 
                onClick={handleGenerateArticle}
                disabled={isGenerateDisabled() || isGenerating}
                className={`bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 flex items-center gap-2 px-8 py-3 min-w-[200px] ${
                  isGenerateDisabled() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating Article...' : 'Generate Article'}
              </Button>
            </div>
            
            <Button 
              onClick={handleNextPage}
              disabled={isNextPageDisabled()}
              variant="default"
              className={`flex items-center gap-2 ${
                isNextPageDisabled() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Next Page
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {isGenerating && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wand2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">Generating Your Article</h3>
              <p className="text-slate-600">Our AI is crafting your technical content...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PromptPreview;
