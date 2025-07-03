import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { FormData } from './LinkedInAutomationForm';

interface PromptEditorStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PromptEditorStep = ({ formData, updateFormData, onNext, onPrev }: PromptEditorStepProps) => {
  // Replace with your actual n8n webhook URL
  const N8N_APPROVAL_WEBHOOK_URL = "https://n8n.getondataconsulting.in/webhook/submitApproval";

  const handleSubmitForApproval = async () => {
    try {
      const response = await fetch(N8N_APPROVAL_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to submit for approval");
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
      console.log('Approval webhook response values:', approvalResponse);
      updateFormData({ approvalResponse });
      onNext();
    } catch (error) {
      alert("Error submitting for approval. Please try again.");
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

      <div className="flex justify-between pt-4">
        <Button 
          onClick={onPrev} 
          variant="outline"
          className="px-6 py-2"
        >
          ← Back to Input
        </Button>
        <Button 
          onClick={handleSubmitForApproval}
          disabled={!formData.finalPrompt.trim()}
          className="px-8 py-2 bg-blue-600 hover:bg-blue-700"
        >
          Submit for Approval →
        </Button>
      </div>
    </div>
  );
};

export default PromptEditorStep;
