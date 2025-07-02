
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, X } from 'lucide-react';
import BlogFormGenerator from '../Blog/BlogFormGenerator';
import FinalPrompt from '../Blog/FinalPrompt';
import ContentValidation from '../Blog/ContentValidation';

const ContentForm = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  
  // Blog workflow states
  const [blogStep, setBlogStep] = useState<'form' | 'prompt' | 'validation'>('form');
  const [blogFormData, setBlogFormData] = useState<any>(null);
  const [finalPrompt, setFinalPrompt] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: '',
    instruction: '',
    shortIntroduction: '',
    research: '',
    content: '',
    factsAndStats: '',
    finalContent: '',
    numberOfSlides: '',
    startImage: '',
    innerImage: ''
  });

  // Simulate fetching existing data for editing
  useEffect(() => {
    const fetchedData = {
      research: 'Sample research data from Supabase...',
      content: 'Sample content data from Supabase...',
      factsAndStats: 'Sample facts and statistics from Supabase...',
      finalContent: 'Sample final content from Supabase...'
    };
    
    setFormData(prev => ({
      ...prev,
      ...fetchedData
    }));
  }, [type]);

  const getFormTitle = () => {
    const titles: Record<string, string> = {
      'website-blog': 'Website Blog',
      'linkedin-post': 'LinkedIn Post',
      'newsletter': 'Newsletter',
      'technical-article': 'Technical Article',
      'facebook-post': 'Facebook Post',
      'carousel': 'Carousel',
      'twitter-post': 'Twitter Post',
      'thought-leadership': 'Thought Leadership'
    };
    return titles[type || ''] || 'Content Form';
  };

  // Blog workflow handlers
  const handleBlogFormNext = (data: any) => {
    setBlogFormData(data);
    setBlogStep('prompt');
  };

  const handleBlogPromptBack = () => {
    setBlogStep('form');
  };

  const handleBlogPromptSubmit = (prompt: string) => {
    setFinalPrompt(prompt);
    setBlogStep('validation');
  };

  const handleBlogValidationBack = () => {
    setBlogStep('prompt');
  };

  const handleBlogPost = () => {
    toast({ title: 'Blog posted successfully!' });
    navigate('/dashboard');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageAdd = (url: string) => {
    if (url.trim()) {
      setImages(prev => [...prev, url.trim()]);
    }
  };

  const handleImageRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call to n8n webhook
      const webhookData = {
        type,
        ...formData,
        images,
        timestamp: new Date().toISOString()
      };

      console.log('Sending to N8N webhook:', webhookData);
      
      // Simulate webhook call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({ title: 'Content submitted successfully!' });
      navigate('/dashboard');
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to submit content',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const renderImageSection = () => {
    const isCarousel = type === 'carousel';
    const maxImages = isCarousel ? parseInt(formData.numberOfSlides) || 1 : 5;

    return (
      <div className="space-y-4">
        <Label>Images {isCarousel && `(${formData.numberOfSlides} slides)`}</Label>
        
        <div className="flex gap-2">
          <Input
            placeholder="Enter image URL or use Google Drive"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleImageAdd(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              const input = document.querySelector('input[placeholder*="image URL"]') as HTMLInputElement;
              if (input?.value) {
                handleImageAdd(input.value);
                input.value = '';
              }
            }}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.slice(0, maxImages).map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/200x100?text=Invalid+URL';
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleImageRemove(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // If it's a website blog, render the blog workflow
  if (type === 'website-blog') {
    switch (blogStep) {
      case 'form':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Website Blog</h1>
            </div>
            <BlogFormGenerator onNext={handleBlogFormNext} initialFormData={blogFormData} />
          </div>
        );
      case 'prompt':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Website Blog - Final Prompt</h1>
            </div>
            <FinalPrompt
              onBack={handleBlogPromptBack}
              onSubmitForApproval={handleBlogPromptSubmit}
              formData={blogFormData}
            />
          </div>
        );
      case 'validation':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Website Blog - Content Validation</h1>
            </div>
            <ContentValidation
              onBack={handleBlogValidationBack}
              onPost={handleBlogPost}
              prompt={finalPrompt}
            />
          </div>
        );
      default:
        return (
          <div className="max-w-4xl mx-auto">
            <BlogFormGenerator onNext={handleBlogFormNext} initialFormData={blogFormData} />
          </div>
        );
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">{getFormTitle()}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New {getFormTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            {type !== 'website-blog' && (
              <div>
                <Label htmlFor="instruction">Instruction *</Label>
                <Textarea
                  id="instruction"
                  name="instruction"
                  value={formData.instruction}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
            )}

            {type === 'website-blog' && (
              <div>
                <Label htmlFor="shortIntroduction">Short Introduction *</Label>
                <Textarea
                  id="shortIntroduction"
                  name="shortIntroduction"
                  value={formData.shortIntroduction}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
            )}

            {type === 'carousel' && (
              <div>
                <Label htmlFor="numberOfSlides">Number of Slides *</Label>
                <Input
                  id="numberOfSlides"
                  name="numberOfSlides"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.numberOfSlides}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            {renderImageSection()}

            {type === 'website-blog' && (
              <>
                <div>
                  <Label htmlFor="startImage">Start Image URL</Label>
                  <Input
                    id="startImage"
                    name="startImage"
                    value={formData.startImage}
                    onChange={handleInputChange}
                    placeholder="Enter start image URL"
                  />
                </div>
                <div>
                  <Label htmlFor="innerImage">Inner Image URL</Label>
                  <Input
                    id="innerImage"
                    name="innerImage"
                    value={formData.innerImage}
                    onChange={handleInputChange}
                    placeholder="Enter inner image URL"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="research">Research (Fetched from Supabase)</Label>
              <Textarea
                id="research"
                name="research"
                value={formData.research}
                onChange={handleInputChange}
                rows={4}
                placeholder="Research content will be fetched automatically..."
              />
            </div>

            <div>
              <Label htmlFor="content">Content (Fetched from Supabase)</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={4}
                placeholder="Content will be fetched automatically..."
              />
            </div>

            <div>
              <Label htmlFor="factsAndStats">Facts and Stats (Fetched from Supabase)</Label>
              <Textarea
                id="factsAndStats"
                name="factsAndStats"
                value={formData.factsAndStats}
                onChange={handleInputChange}
                rows={4}
                placeholder="Facts and statistics will be fetched automatically..."
              />
            </div>

            <div>
              <Label htmlFor="finalContent">Final Content (Fetched from Supabase)</Label>
              <Textarea
                id="finalContent"
                name="finalContent"
                value={formData.finalContent}
                onChange={handleInputChange}
                rows={6}
                placeholder="Final content will be fetched automatically..."
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Submitting...' : 'Submit Content'}
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentForm;
