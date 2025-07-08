import { useState } from "react";

export interface UseGeneratePromptResult {
  loading: boolean;
  error: string | null;
  generatePrompt: (formData: Record<string, unknown>) => Promise<string>;
}

export function useGeneratePrompt(): UseGeneratePromptResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePrompt = async (formData: Record<string, unknown>): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://devilblack.app.n8n.cloud/webhook/carousel-generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      let promptText = '';
      if (Array.isArray(data) && data[0] && typeof data[0]["Prompt:"] === "string") {
        promptText = data[0]["Prompt:"];
      } else if (data && typeof data["Prompt:"] === "string") {
        promptText = data["Prompt:"];
      }
      setLoading(false);
      return promptText;
    } catch (err) {
      setLoading(false);
      setError('Failed to send data to webhook.');
      throw err;
    }
  };

  return { loading, error, generatePrompt };
}
