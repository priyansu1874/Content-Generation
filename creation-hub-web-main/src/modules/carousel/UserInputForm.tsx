import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { useFormContext, FormData } from "./FormContext";
import { useGeneratePrompt } from "./hooks/useGeneratePrompt";

const UserInputForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { formData, setFormData } = useFormContext();
  const { loading: promptLoading, error: promptError, generatePrompt } = useGeneratePrompt();

  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // All fields are now optional; no required fields check

    // Default to 5 if blank or 0
    const dataToSend = {
      ...formData,
      slideCount: formData.slideCount && formData.slideCount > 0 ? formData.slideCount : 5
    };

    setLoading(true);
    try {
      const promptText = await generatePrompt(dataToSend);
      setLoading(false);
      navigate('/carousel/prompt', { state: { prompt: promptText } });
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error",
        description: promptError || "Failed to send data to webhook.",
        variant: "destructive"
      });
      // Do not navigate on error
    }
  };

  // Define a type for the navigation state
  interface LocationState {
    generatedPrompt?: string;
  }

  // Use prompt from navigation state if available
  useEffect(() => {
    const state = location.state as LocationState | null;
    if (state && state.generatedPrompt) {
      setPrompt(state.generatedPrompt);
    } else {
      // ...existing code for loading/generating prompt...
    }
  }, [location.state, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Your Carousel</h1>
          <p className="text-gray-600">Fill in the details below to generate your perfect social media carousel</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Step 1: Content Requirements</CardTitle>
            <CardDescription>
              Provide the details for your carousel generation. All fields are optional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" style={loading ? { pointerEvents: "none", opacity: 0.6 } : {}}>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="topic" className="text-sm font-medium">Carousel Topic/Theme</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Productivity Tips"
                      value={formData.topic}
                      onChange={(e) => handleInputChange('topic', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="objective" className="text-sm font-medium">Objective/Goal</Label>
                    <Select value={formData.objective} onValueChange={(value) => handleInputChange('objective', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select objective" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="educate">Educate</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                        <SelectItem value="entertain">Entertain</SelectItem>
                        <SelectItem value="inform">Inform</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="targetAudience" className="text-sm font-medium">Target Audience</Label>
                    <Input
                      id="targetAudience"
                      placeholder="e.g., Startup founders, 20-35"
                      value={formData.targetAudience}
                      onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slideCount" className="text-sm font-medium">Number of Slides</Label>
                    <Input
                      id="slideCount"
                      type="number"
                      placeholder="e.g., 5"
                      value={formData.slideCount === 0 ? '' : formData.slideCount}
                      onChange={e => {
                        const val = e.target.value;
                        handleInputChange('slideCount', val === '' ? 0 : parseInt(val));
                      }}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                       Enter any number of slides you want.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="platform" className="text-sm font-medium">Platform</Label>
                    <Select value={formData.platform} onValueChange={(value) => handleInputChange('platform', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Content Details */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="headline" className="text-sm font-medium">Headline/Hook (Slide 1)</Label>
                    <Textarea
                      id="headline"
                      placeholder="Optional catchy headline for your first slide"
                      value={formData.headline}
                      onChange={(e) => handleInputChange('headline', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="keyPoints" className="text-sm font-medium">Key Points/Subtopics</Label>
                    <Textarea
                      id="keyPoints"
                      placeholder="One per line or comma-separated"
                      value={formData.keyPoints}
                      onChange={(e) => handleInputChange('keyPoints', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="callToAction" className="text-sm font-medium">Call to Action (Last Slide)</Label>
                    <Input
                      id="callToAction"
                      placeholder="e.g., Follow us for more"
                      value={formData.callToAction}
                      onChange={(e) => handleInputChange('callToAction', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tone" className="text-sm font-medium">Tone/Style</Label>
                    <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="authoritative">Authoritative</SelectItem>
                        <SelectItem value="playful">Playful</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="textLength" className="text-sm font-medium">Text Length per Slide</Label>
                    <Select value={formData.textLength} onValueChange={(value) => handleInputChange('textLength', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select text length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bullets">Bullet Points</SelectItem>
                        <SelectItem value="paragraph">Paragraph</SelectItem>
                        <SelectItem value="quotes">Quotes</SelectItem>
                        <SelectItem value="minimal">Minimal Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6">
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
                
                <Button
                  type="submit"
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Prompt
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserInputForm;
