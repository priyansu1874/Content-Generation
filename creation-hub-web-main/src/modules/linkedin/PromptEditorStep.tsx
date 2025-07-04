import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { FormData } from './LinkedInAutomationForm';
import { useLinkedInFormContext } from './LinkedInFormContext';

interface PromptEditorStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PromptEditorStep = ({ formData, updateFormData, onNext, onPrev }: PromptEditorStepProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Smart button logic
  const { 
    hasGeneratedOnce, 
    hasFormDataChanged, 
    lastGeneratedPrompt,
    generatedPrompt,
    markAsGenerated
  } = useLinkedInFormContext();

  // Replace with your actual n8n webhook URL
  const N8N_APPROVAL_WEBHOOK_URL = "https://n8n.getondataconsulting.in/webhook/submitApproval";

  // Smart button logic for Generate Content button
  const isGenerateEnabled = () => {
    if (!formData.finalPrompt.trim() || isGenerating) return false;
    
    if (hasGeneratedOnce) {
      // Enable if form data changed OR prompt text changed OR no content generated yet
      return hasFormDataChanged() || 
             formData.finalPrompt.trim() !== lastGeneratedPrompt.trim() || 
             !formData.approvalResponse?.trim();
    }
    
    return true;
  };

  // Smart button logic for Next Page button  
  const isNextEnabled = () => {
    // Enable Next if we have generated content and form data hasn't changed
    if (!hasGeneratedOnce || !formData.approvalResponse?.trim()) return false;
    if (hasFormDataChanged()) return false;
    return true;
  };

  const getGenerateButtonStatus = () => {
    if (!formData.finalPrompt.trim()) return "Please enter a prompt";
    if (isGenerating) return "Generating content...";
    
    if (hasGeneratedOnce) {
      const formChanged = hasFormDataChanged();
      const promptChanged = formData.finalPrompt.trim() !== lastGeneratedPrompt.trim();
      const hasContent = formData.approvalResponse?.trim();
      
      if (!formChanged && !promptChanged && hasContent) {
        return "Content already generated with current inputs - change inputs or prompt to regenerate";
      } else if (formChanged) {
        return "Form inputs changed - ready to generate new content";
      } else if (promptChanged) {
        return "Prompt changed - ready to generate new content";
      } else if (!hasContent) {
        return "Ready to generate content";
      }
    }
    
    return "Ready to generate content";
  };

  const getNextButtonStatus = () => {
    if (!hasGeneratedOnce) return "Generate content first";
    if (!formData.approvalResponse?.trim()) return "No content generated yet";
    if (hasFormDataChanged()) return "Generate new content first (inputs changed)";
    return "Ready to preview content";
  };

  const handleGenerateContent = async () => {
    if (!isGenerateEnabled()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch(N8N_APPROVAL_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to generate content");
      const data = await response.json();
      // Extract only the values from the response
      let approvalResponse = "";
      if (Array.isArray(data) && data.length > 0) {
        approvalResponse = Object.values(data[0])
          .map(v => typeof v === 'object' ? JSON.stringify(v, null, 2) : v)
          .join('\n\n');
      } else if (typeof data === 'object') {
        approvalResponse = Object.values(data)
          .map(v => typeof v === 'object' ? JSON.stringify(v, null, 2) : v)
          .join('\n\n');
      } else {
        approvalResponse = String(data);
      }
      console.log('Content generation response:', approvalResponse);
      updateFormData({ approvalResponse });
      
      // Mark as generated for smart button logic
      markAsGenerated(formData.finalPrompt, formData);
      
      // Navigate to the next page (ContentPreviewStep) after successful generation
      onNext();
      
    } catch (error) {
      alert("Error generating content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 2: Final Prompt Editor</h2>
        <p className="text-gray-600">Review and customize the generated prompt before creating content</p>
      </div>

      <div>
        <Label htmlFor="finalPrompt">Final Prompt</Label>
        <Textarea
          id="finalPrompt"
          value={formData.finalPrompt}
          onChange={(e) => updateFormData({ finalPrompt: e.target.value })}
          className="mt-2 min-h-48 font-mono text-sm"
          placeholder="Your prompt will appear here..."
        />
        <p className="text-xs text-gray-500 mt-2">
          Feel free to edit this prompt to better match your requirements. This will be used to generate your LinkedIn content.
        </p>
      </div>

      <div className="pt-4">
        {hasGeneratedOnce && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 shadow-sm mb-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-1">Generate Status:</div>
                <div className={`text-sm font-medium ${
                  formData.finalPrompt.trim() !== lastGeneratedPrompt.trim() || hasFormDataChanged()
                    ? "text-orange-600" 
                    : formData.approvalResponse
                    ? "text-green-600"
                    : "text-blue-600"
                }`}>
                  {formData.approvalResponse 
                    ? "Content generated" 
                    : formData.finalPrompt.trim() !== lastGeneratedPrompt.trim() || hasFormDataChanged()
                    ? "Ready to generate content"
                    : "Ready to generate content"
                  }
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-1">Next Step:</div>
                <div className="text-sm text-gray-600">
                  {formData.approvalResponse 
                    ? "Review and approve the generated content"
                    : formData.finalPrompt.trim() !== lastGeneratedPrompt.trim() || hasFormDataChanged()
                    ? "Generate new content first (inputs changed)"
                    : "Generate content to proceed"
                  }
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center">
          <Button 
            onClick={onPrev} 
            variant="outline"
            className="px-8 py-2"
          >
            ← Back to Input
          </Button>
          <div className="flex gap-3">
            <Button 
              onClick={handleGenerateContent}
              disabled={!isGenerateEnabled()}
              className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              title={getGenerateButtonStatus()}
            >
              {isGenerating ? "Generating..." : "Generate Content"}
            </Button>
            <Button 
              onClick={onNext}
              disabled={!isNextEnabled()}
              className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white"
              title={getNextButtonStatus()}
            >
              Next Page →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptEditorStep;
