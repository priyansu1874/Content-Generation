import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Textarea } from "@/shared/components/ui/textarea";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { useFormContext } from "./FormContext";

const PromptEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    formData,
    hasGeneratedOnce,
    hasGeneratedInThisSession,
    lastGeneratedPrompt,
    isComingFromValidation,
    generatedContent,
    currentPrompt,
    markAsGenerated,
    setComingFromValidation,
    setPrompt,
    resetSession,
    hasFormDataChanged
  } = useFormContext();

  const [prompt, setPromptState] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const initializedRef = useRef(false);

  // Update context when local prompt changes
  const handlePromptChange = (newPrompt: string) => {
    setPromptState(newPrompt);
    setPrompt(newPrompt);
  };

  // Smart button logic
  const isGenerateEnabled = () => {
    if (!prompt.trim()) return false;
    if (isGenerating) return false;
    
    // If we have generated before, check if form data has changed
    if (hasGeneratedOnce) {
      return hasFormDataChanged() || prompt.trim() !== lastGeneratedPrompt.trim();
    }
    
    // First time generation - enable if prompt exists
    return true;
  };

  const isNextEnabled = () => {
    // Enable Next if we have generated content and form data hasn't changed
    // OR if we have content and we're coming from validation
    if (!hasGeneratedOnce || !generatedContent.trim()) return false;
    
    // If form data has changed since last generation, disable Next (force regeneration)
    if (hasFormDataChanged()) return false;
    
    return true;
  };

  const getGenerateButtonStatus = () => {
    if (!prompt.trim()) return "Please enter a prompt";
    if (isGenerating) return "Generating content...";
    
    if (hasGeneratedOnce) {
      const formChanged = hasFormDataChanged();
      const promptChanged = prompt.trim() !== lastGeneratedPrompt.trim();
      
      if (!formChanged && !promptChanged) {
        return "Content already generated with current inputs - change inputs or prompt to regenerate";
      } else if (formChanged) {
        return "Form inputs changed - ready to generate new content";
      } else if (promptChanged) {
        return "Prompt changed - ready to generate new content";
      }
    }
    
    return "Ready to generate content";
  };

  useEffect(() => {
    // Only run this effect once on mount or when location.state changes
    if (initializedRef.current) return;
    
    // Remove any prompt or generated content from localStorage
    localStorage.removeItem('carouselPrompt');
    localStorage.removeItem('carouselGeneratedContent');
    
    // Check if coming from validation page
    const state = location.state as (Record<string, unknown> & { 
      prompt?: string; 
      fromValidation?: boolean;
    }) | null;
    
    let promptValue = "";
    if (state) {
      // Handle coming from validation
      if (state.fromValidation) {
        setComingFromValidation(true);
        // Use the prompt from state when coming back from validation
        promptValue = state.prompt || "";
      } else {
        // Coming from form page - reset session
        resetSession();
        // Support both 'prompt' and 'Prompt:' keys
        if (typeof state.prompt === "string" && state.prompt.trim() !== "") {
          promptValue = state.prompt;
        } else if (typeof state["Prompt:"] === "string" && (state["Prompt:"] as string).trim() !== "") {
          promptValue = state["Prompt:"] as string;
        }
      }
    }
    
    setPromptState(promptValue);
    setPrompt(promptValue); // Update context
    initializedRef.current = true;
  }, [location.state]);

  // Reset the ref when location changes to allow re-initialization
  useEffect(() => {
    initializedRef.current = false;
  }, [location.pathname]);

  const handleSubmit = () => {
    if (!isNextEnabled()) {
      toast({
        title: "No content available",
        description: "Please generate content first before proceeding to the next step.",
        variant: "destructive"
      });
      return;
    }

    // Navigate to output with existing generated content
    navigate('/carousel/output', { 
      state: { 
        content: generatedContent, 
        prompt: prompt 
      } 
    });
  };

  const handleGenerate = async () => {
    if (!isGenerateEnabled()) {
      toast({
        title: "Cannot generate",
        description: getGenerateButtonStatus(),
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("https://priyansu4781.app.n8n.cloud/webhook/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      if (!response.ok) throw new Error("Failed to generate carousel content");
      
      const data = await response.json();
      // Accept both 'content' and 'result' keys, fallback to string
      const content = data.content || data.result || data.prompt || data["Prompt:"] || JSON.stringify(data);
      
      // Mark as generated in context
      markAsGenerated(prompt, content, formData);
      
      // Navigate to output
      navigate("/carousel/output", { state: { content, prompt } });
    } catch (err) {
      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Unknown error occurred while generating carousel",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              onClick={() => navigate('/carousel')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Form
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Review Your Prompt</h1>
          <p className="text-gray-600">Review and edit the AI prompt before generating your carousel content</p>
        </div>

        <Card className="max-w-4xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              Step 2: Edit Your Prompt
            </CardTitle>
            <CardDescription>
              Feel free to modify the AI prompt below before generating your final content. 
              This is your opportunity to fine-tune the instructions for the perfect result.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-3">
                Your AI Prompt:
              </label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                className="min-h-[400px] font-mono text-sm leading-relaxed"
                placeholder="Your generated prompt will appear here..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for editing your prompt:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be specific about the carousel style and slide format you want</li>
                <li>• Add examples if you have a particular carousel layout in mind</li>
                <li>• Specify visual elements, colors, or design preferences</li>
                <li>• Include any LinkedIn-specific requirements or hashtags</li>
                <li>• Mention slide count and content distribution preferences</li>
              </ul>
            </div>

            {/* Button Status Indicator */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Generate Status:</h4>
                  <p className={`text-sm ${
                    isGenerateEnabled() ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {getGenerateButtonStatus()}
                  </p>
                  {hasGeneratedOnce && (
                    <p className="text-xs text-gray-500 mt-1">
                      Form data changed: {hasFormDataChanged() ? 'Yes' : 'No'}
                    </p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Next Step:</h4>
                  <p className={`text-sm ${
                    isNextEnabled() ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {isNextEnabled() 
                      ? 'Ready to view generated content' 
                      : hasFormDataChanged() 
                        ? 'Generate new content first (inputs changed)'
                        : 'Generate content first'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t gap-4">
              <Button
                onClick={() => navigate('/carousel')}
                size="lg"
                variant="outline"
                className="text-white bg-red-600 hover:bg-red-700 border border-red-700 focus:ring-2 focus:ring-red-300 focus:outline-none shadow-sm transition-colors"
                type="button"
              >
                Back
              </Button>
              <div className="flex-1 flex justify-center">
                <Button
                  size="lg"
                  className={`relative flex items-center justify-center gap-2 px-8 py-3 shadow-lg rounded-full font-semibold text-lg transition-all duration-200 focus:ring-2 focus:outline-none border-2 ${
                    isGenerateEnabled() && !isGenerating
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 focus:ring-indigo-300 cursor-pointer'
                      : 'bg-gray-400 text-gray-600 border-gray-400 cursor-not-allowed opacity-50'
                  }`}
                  type="button"
                  onClick={handleGenerate}
                  disabled={!isGenerateEnabled() || isGenerating}
                  title={getGenerateButtonStatus()}
                >
                  {isGenerating && (
                    <svg
                      className="animate-spin h-5 w-5 text-current absolute left-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  )}
                  {isGenerating ? 'Generating...' : 'Generate Carousel'}
                </Button>
              </div>
              <Button
                onClick={handleSubmit}
                size="lg"
                className={`transition-all duration-200 ${
                  isNextEnabled()
                    ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                }`}
                type="button"
                disabled={!isNextEnabled()}
                title={isNextEnabled() ? 'View generated carousel content' : 'Generate content first'}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PromptEditor;
