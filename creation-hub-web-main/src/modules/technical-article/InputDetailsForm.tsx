import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { X, Upload, Image as ImageIcon, ArrowLeft } from 'lucide-react';

// Define the interface directly in this file
export interface ArticleFormData {
  organizationName: string;
  articleTitle: string;
  targetAudience: string[];
  targetAudienceRaw?: string;
  technologyFocus: string;
  articleObjective: string;
  toneOfArticle: string;
  exampleReferences: string;
  keywords: string[];
  keywordsRaw?: string;
  uploadedImages: File[];
  authorName: string;
  webhookResponse?: string;
}

interface InputDetailsFormProps {
  onSubmit: (data: ArticleFormData) => void;
  initialData: ArticleFormData;
  onBack?: () => void;
}

const InputDetailsForm: React.FC<InputDetailsFormProps> = ({ onSubmit, initialData, onBack }) => {
  const [formData, setFormData] = useState<ArticleFormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const organizations = ['Mobio Solutions', 'GetOnDataSolutions', 'GetOnCrmSolutions'];
  const tones = ['Technical', 'Thought-leader', 'Educational', 'Persuasive'];

  const handleInputChange = <K extends keyof ArticleFormData>(field: K, value: ArticleFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newImages = [...formData.uploadedImages, ...files];
    handleInputChange('uploadedImages', newImages);
  };

  const removeImage = (index: number) => {
    const newImages = formData.uploadedImages.filter((_, i) => i !== index);
    handleInputChange('uploadedImages', newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.organizationName || !formData.articleTitle || !formData.technologyFocus || !formData.articleObjective || !formData.toneOfArticle) {
      alert('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    // Prepare FormData for webhook (send all fields, even if empty)
    const data = new FormData();
    data.append('organizationName', formData.organizationName || '');
    data.append('articleTitle', formData.articleTitle || '');
    // Pack technologyFocus, keywords, and targetAudience as arrays in a single named array each
    const techArr = formData.technologyFocus.split(',').map(s => s.trim()).filter(Boolean);
    data.append('technologyFocus', JSON.stringify(techArr));
    const keywordsArr = formData.keywords.join(',').split(',').map(s => s.trim()).filter(Boolean);
    data.append('keywords', JSON.stringify(keywordsArr));
    const audienceArr = (formData.targetAudienceRaw ?? formData.targetAudience.join(',')).split(',').map(s => s.trim()).filter(Boolean);
    data.append('targetAudience', JSON.stringify(audienceArr));
    data.append('articleObjective', formData.articleObjective || '');
    data.append('toneOfArticle', formData.toneOfArticle || '');
    data.append('exampleReferences', formData.exampleReferences || '');
    data.append('authorName', formData.authorName || '');
    if (formData.uploadedImages && formData.uploadedImages.length > 0) {
      formData.uploadedImages.forEach((file: File) => data.append('uploadedImages', file));
    } else {
      data.append('uploadedImages', '');
    }

    try {
      const response = await fetch('https://mobiosolutions.app.n8n.cloud/webhook/inputdetails', {
        method: 'POST',
        body: data
      });
      const result = await response.text();
      // Pass webhook response to parent for PromptPreview
      onSubmit({ ...formData, webhookResponse: result });
    } catch (err) {
      alert('Failed to send data to webhook');
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardTitle className="text-2xl">Article Details</CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="organization" className="text-sm font-medium text-slate-700">
                Organization Name *
              </Label>
              <Select value={formData.organizationName} onValueChange={(value) => handleInputChange('organizationName', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map(org => (
                    <SelectItem key={org} value={org}>{org}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                Article Title *
              </Label>
              <Input
                id="title"
                value={formData.articleTitle}
                onChange={(e) => handleInputChange('articleTitle', e.target.value)}
                placeholder="Enter article title"
                className="mt-1"
              />
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <Label htmlFor="targetAudience" className="text-sm font-medium text-slate-700">Target Audience</Label>
            <Textarea
              id="targetAudience"
              value={formData.targetAudienceRaw ?? formData.targetAudience.join(', ')}
              onChange={e => {
                handleInputChange('targetAudienceRaw', e.target.value);
                handleInputChange('targetAudience', e.target.value.split(',').map(s => s.trim()).filter(Boolean));
              }}
              placeholder="Enter target audiences, separated by commas"
              className="mt-1 min-h-[60px]"
            />
          </div>

          {/* Technology Focus */}
          <div>
            <Label htmlFor="technologyFocus" className="text-sm font-medium text-slate-700">Technology Focus *</Label>
            <Textarea
              id="technologyFocus"
              value={formData.technologyFocus}
              onChange={e => handleInputChange('technologyFocus', e.target.value)}
              placeholder="Enter technology focus (e.g., AI/ML, React, etc.)"
              className="mt-1 min-h-[40px]"
            />
          </div>

          {/* Tone */}
          <div>
            <Label htmlFor="tone" className="text-sm font-medium text-slate-700">
              Tone of Article *
            </Label>
            <Select value={formData.toneOfArticle} onValueChange={(value) => handleInputChange('toneOfArticle', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {tones.map(tone => (
                  <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Article Objective */}
          <div>
            <Label htmlFor="objective" className="text-sm font-medium text-slate-700">
              Article Objective *
            </Label>
            <Textarea
              id="objective"
              value={formData.articleObjective}
              onChange={(e) => handleInputChange('articleObjective', e.target.value)}
              placeholder="Describe what this article should convey or solve..."
              className="mt-1 min-h-[100px]"
            />
          </div>

          {/* Keywords */}
          <div>
            <Label htmlFor="keywords" className="text-sm font-medium text-slate-700">Keywords/Hashtags</Label>
            <Textarea
              id="keywords"
              value={formData.keywordsRaw ?? formData.keywords.join(', ')}
              onChange={e => {
                handleInputChange('keywordsRaw', e.target.value);
                handleInputChange('keywords', e.target.value.split(',').map(s => s.trim()).filter(Boolean));
              }}
              placeholder="Enter keywords, separated by commas"
              className="mt-1 min-h-[40px]"
            />
          </div>

          {/* References and Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="references" className="text-sm font-medium text-slate-700">
                Example References
              </Label>
              <Textarea
                id="references"
                value={formData.exampleReferences}
                onChange={(e) => handleInputChange('exampleReferences', e.target.value)}
                placeholder="URLs or sources for inspiration..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="author" className="text-sm font-medium text-slate-700">
                Author Name
              </Label>
              <Input
                id="author"
                value={formData.authorName}
                onChange={(e) => handleInputChange('authorName', e.target.value)}
                placeholder="Leave blank for organization team"
                className="mt-1"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-sm font-medium text-slate-700">Upload Images</Label>
            <div className="mt-2">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm text-slate-600">Click to upload images</p>
                </div>
              </label>
            </div>
            
            {formData.uploadedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.uploadedImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center border">
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-600 mt-1 truncate">{file.name}</p>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-6">
            {onBack && (
              <Button 
                type="button" 
                variant="outline" 
                size="lg" 
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            )}
            <Button type="submit" size="lg" className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2" disabled={isSubmitting}>
              {isSubmitting && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              )}
              {isSubmitting ? 'Processing...' : 'Continue to Prompt Preview'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InputDetailsForm;
