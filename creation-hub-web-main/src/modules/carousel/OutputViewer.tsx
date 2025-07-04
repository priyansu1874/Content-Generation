import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ArrowLeft, Copy, Download, RefreshCw, CheckCircle } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { useToast } from "@/shared/hooks/use-toast";
import { useFormContext } from "./FormContext";

const OutputViewer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setComingFromValidation, resetSession } = useFormContext();
  
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleBackToPrompt = () => {
    setComingFromValidation(true);
    navigate('/carousel/prompt', { 
      state: { 
        prompt, 
        content: generatedContent,
        fromValidation: true 
      } 
    });
  };

  const handleCreateAnother = () => {
    resetSession();
    navigate('/carousel');
  };

  useEffect(() => {
    // Remove any prompt or generated content from localStorage
    localStorage.removeItem('carouselPrompt');
    localStorage.removeItem('carouselGeneratedContent');

    // Get prompt and content from navigation state
    const state = location.state as { prompt?: string; content?: string } | null;
    if (!state || !state.prompt || !state.content) {
      toast({
        title: "No prompt found",
        description: "Please complete the previous steps first.",
        variant: "destructive"
      });
      navigate('/carousel');
      return;
    }
    setPrompt(state.prompt);
    // If content is JSON, extract the value (first string value found)
    let contentValue = state.content;
    try {
      const parsed = JSON.parse(state.content);
      if (typeof parsed === 'object' && parsed !== null) {
        // Find the first string value in the object
        const firstString = Object.values(parsed).find(v => typeof v === 'string');
        if (typeof firstString === 'string') {
          contentValue = firstString;
        }
      }
    } catch {
      // Ignore JSON parse errors and use the original content
    }
    setGeneratedContent(contentValue);
    setIsGenerating(false);
  }, [navigate, toast, location.state]);

  const generateContent = async (promptText: string) => {
    setIsGenerating(true);

    // Simulate AI content generation (replace with actual AI API call)
    setTimeout(() => {
      const mockContent = `# Social Media Carousel: ${promptText.includes('"') ? promptText.split('"')[1] : 'Your Topic'}

## Slide 1: Hook/Title
🚀 **Ready to Transform Your Productivity?**
*Discover the game-changing strategies that successful entrepreneurs use daily*

## Slide 2: Problem Statement
❌ **Most People Struggle With:**
• Endless to-do lists that never get completed
• Constant distractions and interruptions
• Feeling overwhelmed by competing priorities
• Working harder but not smarter

## Slide 3: Solution Overview
✅ **The Productivity Power Framework:**
• Time-blocking for focused work sessions
• Priority matrix for decision making
• Energy management over time management
• Strategic saying "no" to protect your focus

## Slide 4: Key Strategy #1
⏰ **Time-Blocking Magic**
• Schedule specific tasks in calendar blocks
• Treat appointments with yourself as sacred
• Include buffer time for unexpected tasks
• Review and adjust weekly

## Slide 5: Key Strategy #2
🎯 **The Priority Matrix**
• Urgent + Important = Do First
• Important + Not Urgent = Schedule
• Urgent + Not Important = Delegate
• Neither = Eliminate

## Slide 6: Key Strategy #3
⚡ **Energy-Based Planning**
• Match high-energy times to difficult tasks
• Use low-energy periods for routine work
• Take breaks before you need them
• Honor your natural rhythms

## Slide 7: Implementation Tips
🛠️ **Getting Started:**
• Start with just 2-3 time blocks per day
• Use the 2-minute rule for quick tasks
• Review your system weekly
• Be patient with yourself as you adapt

## Slide 8: Call to Action
💪 **Your Next Steps:**
✓ Choose ONE strategy to implement this week
✓ Share your productivity wins in the comments
✓ Follow for more business growth tips
✓ Tag a friend who needs to see this!

---

**Social Media Caption:**
🚀 Productivity isn't about doing more—it's about doing what matters most! These 3 strategies have helped thousands of entrepreneurs reclaim their time and focus. Which one will you try first? 👇

#productivity #entrepreneurship #timemanagement #businesstips #success #focus #leadership #worklifebalance #entrepreneur #productivityhacks

---

**Notes for Design:**
- Use consistent brand colors throughout
- Bold headers for each slide
- Bullet points for easy scanning
- Include relevant icons/emojis
- Maintain visual hierarchy
- Ensure text is readable on mobile`;

      setGeneratedContent(mockContent);
      localStorage.setItem('carouselGeneratedContent', mockContent);
      setIsGenerating(false);
    }, 2000);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      toast({
        title: "Content copied!",
        description: "The carousel content has been copied to your clipboard."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please select and copy the content manually.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'carousel-content.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download started",
      description: "Your carousel content is being downloaded."
    });
  };

  const handleRegenerate = () => {
    generateContent(prompt);
    toast({
      title: "Regenerating content",
      description: "Creating new carousel content with your prompt."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Generated Carousel</h1>
          <p className="text-gray-600">Review, copy, or download your AI-generated carousel content</p>
        </div>

        <Card className="max-w-5xl mx-auto shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Step 3: Your Generated Content</CardTitle>
                <CardDescription>
                  Your carousel content is ready! You can copy it, download it, or regenerate with the same prompt.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCopy}
                  disabled={isGenerating}
                >
                  {copied ? (
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDownload}
                  disabled={isGenerating}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700">Generating your carousel content...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white border rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
                  <div className="prose prose-indigo max-w-none text-sm leading-relaxed">
                    {(() => {
                      function formatTitles(str: string) {
                        // Ensure Title: or title: always starts on a new line, even if at the start or after text
                        // This will insert a newline before every Title: or title: unless it's already at the start of a line
                        return str.replace(/(?!^)(?<!\n)(Title:|title:)/g, '\n$1');
                      }
                      let content = generatedContent;
                      try {
                        const parsed = JSON.parse(generatedContent);
                        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                          // Show only the values (not keys) from all key-value pairs in the response, joined with double newlines
                          const allStringValues = Object.entries(parsed)
                            .filter(([_, v]) => typeof v === 'string')
                            .map(([_, v]) => v as string);
                          if (allStringValues.length > 0) {
                            content = allStringValues.join('\n\n');
                          } else {
                            // If no string value, fallback to empty string
                            content = '';
                          }
                        }
                      } catch {
                        // Ignore JSON parse errors and use the original content
                      }
                      // Remove leading array with output/output key if present
                      // e.g. remove: [{"output": ...}] or [{"Output": ...}]
                      content = content.replace(/^\s*\[\s*{\s*"[oO]utput"\s*:\s*/m, '');
                      content = content.replace(/}\s*]$/m, '');
                      // Replace \n with real newlines for markdown and format Title:
                      content = formatTitles(content.replace(/\\n/g, '\n'));
                      return <ReactMarkdown>{content}</ReactMarkdown>;
                    })()}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-green-900 mb-2">🎉 Your carousel is ready!</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Copy the content and paste it into your design tool</li>
                    <li>• Download as a text file for future reference</li>
                    <li>• Regenerate if you want different variations</li>
                    <li>• Use the design notes at the bottom for visual guidance</li>
                  </ul>
                </div>

                <div className="flex justify-between items-center pt-6 border-t">
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handleCreateAnother}
                    >
                      Create Another Carousel
                    </Button>
                    <Button
                      onClick={handleBackToPrompt}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Back to Edit Prompt
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="mr-2 h-4 w-4" />
                      )}
                      {copied ? 'Copied!' : 'Copy Content'}
                    </Button>
                    <Button 
                      onClick={handleDownload} 
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Content
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OutputViewer;
