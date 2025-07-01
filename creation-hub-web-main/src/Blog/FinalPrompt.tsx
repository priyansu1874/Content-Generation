import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, FileText } from 'lucide-react';

interface FinalPromptProps {
  onBack: () => void;
  onSubmitForApproval: (prompt: string) => void;
  formData?: any;
  systemPrompt?: string;
}

const FinalPrompt: React.FC<FinalPromptProps> = ({
  onBack,
  onSubmitForApproval,
  formData,
  systemPrompt = '',
}) => {
  const [finalPrompt, setFinalPrompt] = useState('');
  const [promptLines, setPromptLines] = useState<string[]>([]);

  useEffect(() => {
    // Convert JSON and \n to readable text
    const readablePrompt = parseSystemPrompt(systemPrompt);
    const lines = readablePrompt.split('\n').map(line => line.trim());
    setPromptLines(lines);
  }, [systemPrompt]);

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
  console.log("responne", formData?.webhookResponse);
  const handleSubmit = async () => {
    if (!finalPrompt.trim()) return;

    try {
      const res = await fetch('https://priyansu4781.app.n8n.cloud/webhook/83037732-608c-4f27-9b81-04c49daae6d9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, finalPrompt }),
      });
      const data = await res.text();
      onSubmitForApproval?.(data);
    } catch {
      setFinalPrompt('Error: Failed to get response from webhook.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Final Prompt Review</h1>
          <p className="text-lg text-gray-600">Review and edit the final prompt for AI generation</p>
        </div>

        {/* System Prompt Section */}
        {systemPrompt && (
          <Card className="mb-8 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">System Prompt (line by line)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-sm whitespace-pre-wrap max-h-64 overflow-y-auto p-2">
                {promptLines.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                onChange={e => setFinalPrompt(e.target.value)}
                spellCheck={true}
              />
            </div>

            <div className="flex flex-wrap gap-4 justify-between">
              <Button onClick={onBack} variant="outline" className="border-gray-300 hover:bg-gray-50 px-6 py-3" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Form
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg font-medium shadow-lg"
                size="lg"
                disabled={!finalPrompt.trim()}
              >
                Submit for Approval
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function parseSystemPrompt(raw: string): string {
  // Try to parse JSON if it's an array/object
  let promptText = raw;
  try {
    const parsed = JSON.parse(raw);
    // If it's an array with objects, get the first object's systemPrompt property
    if (Array.isArray(parsed) && parsed[0]?.systemPrompt) {
      promptText = parsed[0].systemPrompt;
    } else if (parsed.systemPrompt) {
      promptText = parsed.systemPrompt;
    }
  } catch {
    // If not JSON, use as is
    promptText = raw;
  }
  // Replace all \n (escaped newlines) with real newlines
  return promptText.replace(/\\n/g, '\n');
}

export default FinalPrompt;
