import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThumbsUp, MessageCircle, Repeat2, Send } from 'lucide-react';
import type { FormData } from './LinkedInAutomationForm';

export interface ContentPreviewStepProps {
  formData: FormData;
  onPrev: () => void;
  onPost?: () => void;
}

const ContentPreviewStep = ({ formData, onPrev }: ContentPreviewStepProps) => {
  // Replace with your actual LinkedIn webhook URL
  const N8N_LINKEDIN_WEBHOOK_URL = "https://n8n.getondataconsulting.in/webhook/likedinPost";

  const handlePostToLinkedIn = async () => {
    try {
      let body;
      let headers;
      if (formData.mediaFile) {
        // If media file is present, use FormData to send binary
        body = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (key === 'mediaFile' && value) {
            body.append('mediaFile', value as File);
          } else if (value !== undefined && value !== null) {
            body.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
          }
        });
        headers = undefined; // Let browser set multipart/form-data
      } else {
        // No media file, send as JSON
        body = JSON.stringify(formData);
        headers = { "Content-Type": "application/json" };
      }
      const response = await fetch(N8N_LINKEDIN_WEBHOOK_URL, {
        method: "POST",
        headers,
        body,
      });
      if (!response.ok) throw new Error("Failed to post to LinkedIn");
      alert('Post scheduled for LinkedIn! 🎉');
      setTimeout(() => {
        window.location.href = window.location.origin;
      }, 100); // Give alert time to show before reload
    } catch (error) {
      alert('Error posting to LinkedIn. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 3: Final Content Preview</h2>
        <p className="text-gray-600">Review your generated LinkedIn content before posting</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-blue-500 text-white font-semibold">
                  {formData.postAs === 'company' && formData.companyName 
                    ? formData.companyName.charAt(0).toUpperCase()
                    : 'U'
                  }
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  {formData.postAs === 'company' && formData.companyName 
                    ? formData.companyName 
                    : 'Your Name'
                  }
                </div>
                <div className="text-sm text-gray-500">
                  {formData.targetAudience} • Now
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-gray-900 whitespace-pre-line leading-relaxed">
                {formData.approvalResponse
                  ? formData.approvalResponse
                  //     .split(/\n\n/)
                  //     .map(line => line.replace(/^.*?:\s?/s, ''))
                  //     .join('\n\n')
                  : 'No approval response yet.'}
              </div>
            </div>

            {(formData.mediaFile || formData.mediaUrl) && (
              <div className="mb-4">
                <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
                  📷 Media attachment will appear here
                </div>
              </div>
            )}

            <div className="border-t pt-3">
              <div className="flex items-center justify-between text-gray-500">
                <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                  <ThumbsUp className="w-5 h-5" />
                  <span>Like</span>
                </button>
                <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>Comment</span>
                </button>
                <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                  <Repeat2 className="w-5 h-5" />
                  <span>Repost</span>
                </button>
                <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                  <Send className="w-5 h-5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          onClick={onPrev} 
          variant="outline"
          className="px-6 py-2"
        >
          ← Back to Prompt Editor
        </Button>
        <Button 
          onClick={handlePostToLinkedIn}
          className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white"
        >
          Post to LinkedIn ✅
        </Button>
      </div>
    </div>
  );
};

export default ContentPreviewStep;
