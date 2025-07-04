import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Upload, Link, X, ArrowLeft } from 'lucide-react';
import type { FormData } from './LinkedInAutomationForm';
import { useLinkedInFormContext } from './LinkedInFormContext';

interface InputDetailsStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onBack?: () => void;
}

const InputDetailsStep = ({ formData, updateFormData, onNext, onBack }: InputDetailsStepProps) => {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Smart button logic
  const { 
    hasGeneratedOnce, 
    hasFormDataChanged, 
    markAsGenerated,
    lastGeneratedPrompt,
    generatedPrompt,
    clearGeneratedContent
  } = useLinkedInFormContext();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;
    
    const files = Array.from(fileList).filter(file => 
      file.type.startsWith('image/') // Only accept image files
    );

    if (files.length > 0) {
      const newImages = [...uploadedImages, ...files];
      setUploadedImages(newImages);
      
      // Create previews for new images
      const newPreviews = [...imagePreviews];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newPreviews.push(e.target.result as string);
            setImagePreviews([...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
      
      updateFormData({ mediaFile: newImages[0], mediaOption: 'upload' });
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setUploadedImages(newImages);
    setImagePreviews(newPreviews);
    
    updateFormData({ 
      mediaFile: newImages.length > 0 ? newImages[0] : undefined,
      mediaOption: newImages.length > 0 ? 'upload' : 'none'
    });
  };

  const isFormValid = () => {
    const basicFieldsValid = formData.title.trim() && formData.description.trim() && formData.targetAudience.trim();
    const companyNameValid = formData.postAs === 'individual' || (formData.postAs === 'company' && formData.companyName.trim());
    const personaValid = formData.persona.trim();
    
    return basicFieldsValid && companyNameValid && personaValid;
  };

  // Smart button logic functions
  const isGenerateEnabled = () => {
    if (!isFormValid()) return false;
    if (isGenerating) return false;
    
    // If we have generated before, check if form data has changed
    if (hasGeneratedOnce) {
      return hasFormDataChanged();
    }
    
    // First time generation - enable if form is valid
    return true;
  };

  // Smart button logic for Next Page button
  const isNextEnabled = () => {
    if (!hasGeneratedOnce || !formData.finalPrompt.trim()) return false;
    if (hasFormDataChanged()) return false;
    return true;
  };

  const getGenerateButtonStatus = () => {
    if (!isFormValid()) return "Please fill in all required fields";
    if (isGenerating) return "Generating prompt...";
    
    if (hasGeneratedOnce) {
      const formChanged = hasFormDataChanged();
      
      if (!formChanged) {
        return "Prompt already generated with current inputs - change inputs to regenerate";
      } else {
        return "Form inputs changed - ready to generate new prompt";
      }
    }
    
    return "Ready to generate prompt";
  };

  const getNextButtonStatus = () => {
    if (!hasGeneratedOnce) return "Generate prompt first";
    if (!formData.finalPrompt.trim()) return "No prompt generated yet";
    if (hasFormDataChanged()) return "Generate new prompt first (inputs changed)";
    return "Ready to proceed to prompt editor";
  };

  // Replace with your actual n8n webhook URL
  const N8N_WEBHOOK_URL = "https://n8n.getondataconsulting.in/webhook/createPrompt";

  const handleGeneratePrompt = async () => {
    if (!isGenerateEnabled()) return;
    
    // If form data has changed, clear any existing generated content first
    if (hasGeneratedOnce && hasFormDataChanged()) {
      clearGeneratedContent();
    }
    
    setIsGenerating(true);
    try {
      updateFormData({ finalPrompt: "" });
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
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers,
        body,
      });
      if (!response.ok) throw new Error("Failed to generate prompt");
      const data = await response.json();
      // Print key-value pairs in the final prompt area, skip binary/object data
      let prompt = "";
      if (Array.isArray(data) && data.length > 0) {
        const obj = data[0];
        prompt = Object.entries(obj)
          .filter(([_, value]) => typeof value !== 'object' || value === null)
          .map(([key, value]) => `${key}: ${String(value)}`)
          .join('\n');
      } else if (typeof data === 'object' && data !== null) {
        prompt = Object.entries(data)
          .filter(([_, value]) => typeof value !== 'object' || value === null)
          .map(([key, value]) => `${key}: ${String(value)}`)
          .join('\n');
      } else {
        prompt = String(data); // fallback for debugging
      }
      
      // Clear any existing generated content since we're generating a new prompt
      updateFormData({ 
        finalPrompt: prompt,
        approvalResponse: '' // Clear old content when prompt changes
      });
      
      // Mark as generated for smart button logic
      markAsGenerated(prompt, formData);
      
      onNext();
    } catch (error) {
      alert("Error generating prompt. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Input Details</h2>
        <p className="text-gray-600">Enter the basic information for your LinkedIn post</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Post Title *</Label>
            <Input
              id="title"
              placeholder="Enter a catchy title..."
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Post Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the context or idea behind the title..."
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              className="mt-1 min-h-20"
            />
          </div>

          <div>
            <Label htmlFor="audience">Target Audience *</Label>
            <Input
              id="audience"
              placeholder="e.g., Tech Professionals, HR Leaders, Startup Founders"
              value={formData.targetAudience}
              onChange={(e) => updateFormData({ targetAudience: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="instructions">Special Instructions</Label>
            <Textarea
              style={{ height: '162px' }}
              id="instructions"
              placeholder="Mention any specific tone, hashtags, emoji preference, etc."
              value={formData.specialInstructions}
              onChange={(e) => updateFormData({ specialInstructions: e.target.value })}
              className="mt-1 min-h-20"
            />
          </div>

          <div>
            <Label htmlFor="tone">Tone of the Content</Label>
            <Select value={formData.tone} onValueChange={(value) => updateFormData({ tone: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Informal">Informal</SelectItem>
                <SelectItem value="Inspiring">Inspiring</SelectItem>
                <SelectItem value="Humorous">Humorous</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="persona">Select Persona *</Label>
            <Select value={formData.persona} onValueChange={(value) => updateFormData({ persona: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Founder">Founder</SelectItem>
                <SelectItem value="Recruiter">Recruiter</SelectItem>
                <SelectItem value="Engineer">Engineer</SelectItem>
                <SelectItem value="Analyst">Analyst</SelectItem>
                <SelectItem value="Designer">Designer</SelectItem>
                <SelectItem value="Marketer">Marketer</SelectItem>
                <SelectItem value="Executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="postType">Post Type</Label>
            <Select value={formData.postType} onValueChange={(value) => updateFormData({ postType: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Text">Text</SelectItem>
                <SelectItem value="Image">Image</SelectItem>
                <SelectItem value="Video">Video</SelectItem>
                <SelectItem value="Carousel">Carousel</SelectItem>
                <SelectItem value="Newsletter">Newsletter</SelectItem>
                <SelectItem value="Event">Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="postLength">Post Length</Label>
            <Select value={formData.postLength} onValueChange={(value) => updateFormData({ postLength: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Short">Short( 50-150 words)</SelectItem>
                <SelectItem value="Medium">Medium (150-300 words)</SelectItem>
                <SelectItem value="Long">Long (300-600 words)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Posting As</Label>
            <RadioGroup
              value={formData.postAs}
              onValueChange={(value: 'individual' | 'company') => updateFormData({ postAs: value })}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual">Individual</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="company" id="company" />
                <Label htmlFor="company">Company</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {formData.postAs === 'company' && (
        <div>
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            placeholder="e.g., Mobio Solutions"
            value={formData.companyName}
            onChange={(e) => updateFormData({ companyName: e.target.value })}
            className="mt-1"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Include Call to Action?</Label>
          <RadioGroup
            value={formData.includeCTA}
            onValueChange={(value: 'yes' | 'no') => updateFormData({ includeCTA: value })}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="cta-yes" />
              <Label htmlFor="cta-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="cta-no" />
              <Label htmlFor="cta-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label>Add Summary Analytics?</Label>
          <RadioGroup
            value={formData.includeAnalytics}
            onValueChange={(value: 'yes' | 'no') => updateFormData({ includeAnalytics: value })}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="analytics-yes" />
              <Label htmlFor="analytics-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="analytics-no" />
              <Label htmlFor="analytics-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label>Include Hashtags?</Label>
          <RadioGroup
            value={formData.includeHashtags}
            onValueChange={(value: 'yes' | 'no') => updateFormData({ includeHashtags: value })}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="hashtags-yes" />
              <Label htmlFor="hashtags-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="hashtags-no" />
              <Label htmlFor="hashtags-no">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div>
        <Label>Media Upload (Optional)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <Upload className="w-8 h-8 text-blue-500 mb-2" />
                  <span className="text-sm font-medium">Upload Images</span>
                  <span className="text-xs text-gray-500">Multiple images allowed</span>
                </div>
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </CardContent>
          </Card>

          <Card className="cursor-not-allowed opacity-60">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <Link className="w-8 h-8 text-green-500 mb-2" />
                <span className="text-sm font-medium">Insert URL</span>
                <Input
                  placeholder="Image/Video URL"
                  value={formData.mediaUrl}
                  onChange={() => {}}
                  className="mt-2 text-xs"
                  disabled
                />
                <span className="text-xs text-gray-400 mt-1">(Currently disabled)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {imagePreviews.length > 0 && (
          <div className="mt-4">
            <Label className="text-sm font-medium">Image Previews</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md border"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    type="button"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-4">
        {hasGeneratedOnce && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 shadow-sm mb-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-1">Generate Status:</div>
                <div className={`text-sm font-medium ${
                  hasFormDataChanged() 
                    ? "text-orange-600" 
                    : "text-green-600"
                }`}>
                  {hasFormDataChanged() ? "Ready to generate prompt" : "Prompt generated"}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-1">Next Step:</div>
                <div className="text-sm text-gray-600">
                  {hasFormDataChanged() ? "Generate new prompt first (inputs changed)" : "Review and edit the generated prompt"}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center">
          {onBack && (
            <Button 
              onClick={onBack} 
              variant="outline"
              className="px-8 py-2 inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          )}
          <div className="flex gap-3">
            <Button 
              onClick={handleGeneratePrompt} 
              disabled={!isGenerateEnabled()}
              className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              title={getGenerateButtonStatus()}
            >
              {isGenerating ? "Generating..." : hasGeneratedOnce && !hasFormDataChanged() ? "Regenerate Prompt" : "Generate Prompt"}
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

export default InputDetailsStep;
