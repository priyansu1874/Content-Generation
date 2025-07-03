import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Slider } from '@/shared/components/ui/slider';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible';
import { ChevronDown, ChevronUp, Calendar, Tag, Link, User, FileText, Search, Clock, ArrowLeft } from 'lucide-react';
import { DatePicker } from './DatePicker';
import { TagInput } from './TagInput';
import { URLInput } from './URLInput';

interface BlogFormData {
  title: string;
  slug: string;
  author: string;
  publishDate: Date | null;
  status: string;
  categories: string[];
  tags: string[];
  targetAudience: string;
  primaryGoal: string;
  toneOfVoice: string;
  wordCountRange: string;
  callToAction: string;
  referenceUrls: string[];
  outline: string;
  seoTitle: string;
  metaDescription: string;
  focusKeywords: string[];
  internalLinks: string[];
  externalLinks: string[];
  imageSuggestions: string;
  creativityLevel: number[];
  template: string;
  language: string;
  includeQuotes: boolean;
}

interface BlogFormGeneratorNextData extends BlogFormData {
  webhookResponse?: string;
}

export interface BlogFormGeneratorProps {
  onNext: (data: BlogFormGeneratorNextData) => void;
  initialFormData?: any;
  onBack?: () => void;
}

const BlogFormGenerator = ({ onNext, initialFormData, onBack }: BlogFormGeneratorProps) => {
  const [formData, setFormData] = useState<BlogFormData>(
    initialFormData || {
      title: '',
      slug: '',
      author: 'Current User',
      publishDate: null,
      status: 'draft',
      categories: [],
      tags: [],
      targetAudience: '',
      primaryGoal: '',
      toneOfVoice: '',
      wordCountRange: '',
      callToAction: '',
      referenceUrls: [],
      outline: '',
      seoTitle: '',
      metaDescription: '',
      focusKeywords: [],
      internalLinks: [],
      externalLinks: [],
      imageSuggestions: '',
      creativityLevel: [50],
      template: '',
      language: 'english',
      includeQuotes: false,
    }
  );
  const [customPrimaryGoal, setCustomPrimaryGoal] = useState('');
  const [customToneOfVoice, setCustomToneOfVoice] = useState('');

  const [openSections, setOpenSections] = useState({
    basic: true,
    content: true,
    seo: false,
    ai: true,
  });

  useEffect(() => {
    if (initialFormData) {
      setFormData(initialFormData);

      // Restore customPrimaryGoal if needed
      if (
        initialFormData.primaryGoal &&
        !['educate', 'inform', 'entertain', 'convert', ''].includes(initialFormData.primaryGoal)
      ) {
        setCustomPrimaryGoal(initialFormData.primaryGoal);
        setFormData(prev => ({ ...prev, primaryGoal: 'custom' }));
      } else {
        setCustomPrimaryGoal('');
      }

      // Restore customToneOfVoice if needed
      if (
        initialFormData.toneOfVoice &&
        !['professional', 'casual', 'technical', 'storytelling', 'humorous', ''].includes(initialFormData.toneOfVoice)
      ) {
        setCustomToneOfVoice(initialFormData.toneOfVoice);
        setFormData(prev => ({ ...prev, toneOfVoice: 'custom' }));
      } else {
        setCustomToneOfVoice('');
      }
    }
  }, [initialFormData]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: generateSlug(value)
    }));
  };

  const handleSubmit = async (action: 'generate' | 'clear') => {
    if (action === 'clear') {
      setFormData({
        title: '',
        slug: '',
        author: 'Current User',
        publishDate: null,
        status: 'draft',
        categories: [],
        tags: [],
        targetAudience: '',
        primaryGoal: '',
        toneOfVoice: '',
        wordCountRange: '',
        callToAction: '',
        referenceUrls: [],
        outline: '',
        seoTitle: '',
        metaDescription: '',
        focusKeywords: [],
        internalLinks: [],
        externalLinks: [],
        imageSuggestions: '',
        creativityLevel: [50],
        template: '',
        language: 'english',
        includeQuotes: false,
      });
      setCustomPrimaryGoal('');
      return;
    }

    // Use customPrimaryGoal if "custom" is selected
    const submitData = {
      ...formData,
      primaryGoal: formData.primaryGoal === 'custom' ? customPrimaryGoal : formData.primaryGoal,
      toneOfVoice: formData.toneOfVoice === 'custom' ? customToneOfVoice : formData.toneOfVoice,
    };

    if (action === 'generate') {
      try {
        const response = await fetch('https://priyansu4781.app.n8n.cloud/webhook/669ff8d0-1c76-4361-a74b-c64accb29d7f', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });
        const data = await response.text();
        if (onNext) {
          onNext({ ...submitData, webhookResponse: typeof data === 'string' ? data : '' });
        }
      } catch (error) {
        console.error('Failed to send form data:', error);
        if (onNext) {
          onNext({ ...submitData, webhookResponse: 'Error: Failed to get response from webhook.' });
        }
      }
    } else {
      console.log(`${action} blog with data:`, submitData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">AI Blog Generator</h1>
          <p className="text-lg text-gray-600">Create compelling blog content with intelligent assistance</p>
        </div>

        <div className="space-y-6">
          {/* Section 1: Basic Blog Details */}
          <Collapsible open={openSections.basic} onOpenChange={() => toggleSection('basic')}>
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      Basic Blog Details
                    </div>
                    {openSections.basic ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium text-gray-700">Blog Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter your blog post headline..."
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug" className="text-sm font-medium text-gray-700">URL Slug</Label>
                      <Input
                        id="slug"
                        placeholder="url-friendly-slug"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Hidden fields - keeping in state but not showing in UI */}
                  <div className="hidden">
                    <Select value={formData.author} onValueChange={(value) => setFormData(prev => ({ ...prev, author: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Current User">Current User</SelectItem>
                      </SelectContent>
                    </Select>
                    <DatePicker
                      selected={formData.publishDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, publishDate: date }))}
                    />
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                    <TagInput
                      tags={formData.categories}
                      onChange={(tags) => setFormData(prev => ({ ...prev, categories: tags }))}
                    />
                    <TagInput
                      tags={formData.tags}
                      onChange={(tags) => setFormData(prev => ({ ...prev, tags: tags }))}
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Section 2: Content Guidance */}
          <Collapsible open={openSections.content} onOpenChange={() => toggleSection('content')}>
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <Tag className="w-4 h-4 text-white" />
                      </div>
                      Content Guidance
                    </div>
                    {openSections.content ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Target Audience</Label>
                      <Input
                        placeholder="e.g., Developers, Small business owners..."
                        value={formData.targetAudience}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                        className="border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Primary Goal</Label>
                      <Select
                        value={
                          ['educate', 'inform', 'entertain', 'convert'].includes(formData.primaryGoal)
                            ? formData.primaryGoal
                            : formData.primaryGoal === 'custom'
                              ? 'custom'
                              : ''
                        }
                        onValueChange={(value) => {
                          if (value === 'custom') {
                            setFormData(prev => ({ ...prev, primaryGoal: 'custom' }));
                          } else {
                            setFormData(prev => ({ ...prev, primaryGoal: value }));
                            setCustomPrimaryGoal('');
                          }
                        }}
                      >
                        <SelectTrigger className="border-gray-200">
                          <SelectValue placeholder="Select primary goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="educate">Educate</SelectItem>
                          <SelectItem value="inform">Inform</SelectItem>
                          <SelectItem value="entertain">Entertain</SelectItem>
                          <SelectItem value="convert">Convert</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.primaryGoal === 'custom' && (
                        <Input
                          className="mt-2"
                          placeholder="Enter custom primary goal"
                          value={customPrimaryGoal}
                          onChange={e => setCustomPrimaryGoal(e.target.value)}
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Tone of Voice</Label>
                      <Select
                        value={
                          ['professional', 'casual', 'technical', 'storytelling', 'humorous'].includes(formData.toneOfVoice)
                            ? formData.toneOfVoice
                            : formData.toneOfVoice === 'custom'
                              ? 'custom'
                              : ''
                        }
                        onValueChange={(value) => {
                          if (value === 'custom') {
                            setFormData(prev => ({ ...prev, toneOfVoice: 'custom' }));
                          } else {
                            setFormData(prev => ({ ...prev, toneOfVoice: value }));
                            setCustomToneOfVoice('');
                          }
                        }}
                      >
                        <SelectTrigger className="border-gray-200">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="storytelling">Storytelling</SelectItem>
                          <SelectItem value="humorous">Humorous</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.toneOfVoice === 'custom' && (
                        <Input
                          className="mt-2"
                          placeholder="Enter custom tone of voice"
                          value={customToneOfVoice}
                          onChange={e => setCustomToneOfVoice(e.target.value)}
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Word Count Range</Label>
                      <Select value={formData.wordCountRange} onValueChange={(value) => setFormData(prev => ({ ...prev, wordCountRange: value }))}>
                        <SelectTrigger className="border-gray-200">
                          <SelectValue placeholder="Select word count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="300-500">300-500 words</SelectItem>
                          <SelectItem value="500-800">500-800 words</SelectItem>
                          <SelectItem value="800-1000">800-1000 words</SelectItem>
                          <SelectItem value="1000-1500">1000-1500 words</SelectItem>
                          <SelectItem value="1500+">1500+ words</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cta" className="text-sm font-medium text-gray-700">Call-to-Action</Label>
                    <Input
                      id="cta"
                      placeholder="e.g., Subscribe to newsletter, Contact us, Read more..."
                      value={formData.callToAction}
                      onChange={(e) => setFormData(prev => ({ ...prev, callToAction: e.target.value }))}
                      className="border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Reference URLs</Label>
                    <URLInput
                      urls={formData.referenceUrls}
                      onChange={(urls) => setFormData(prev => ({ ...prev, referenceUrls: urls }))}
                      placeholder="Add reference URLs..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outline" className="text-sm font-medium text-gray-700">Outline / Key Points</Label>
                    <Textarea
                      id="outline"
                      placeholder="• Key point 1&#10;• Key point 2&#10;• Key point 3..."
                      value={formData.outline}
                      onChange={(e) => setFormData(prev => ({ ...prev, outline: e.target.value }))}
                      className="border-gray-200 focus:border-green-500 focus:ring-green-500/20 min-h-[120px]"
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Section 3: SEO & Enhancements */}
          <Collapsible open={openSections.seo} onOpenChange={() => toggleSection('seo')}>
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Search className="w-4 h-4 text-white" />
                      </div>
                      SEO & Enhancements
                      <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                    </div>
                    {openSections.seo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="seoTitle" className="text-sm font-medium text-gray-700">SEO Meta Title</Label>
                      <Input
                        id="seoTitle"
                        placeholder="SEO-optimized title for search engines"
                        value={formData.seoTitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                        className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Focus Keywords</Label>
                      <TagInput
                        tags={formData.focusKeywords}
                        onChange={(tags) => setFormData(prev => ({ ...prev, focusKeywords: tags }))}
                        placeholder="Add SEO keywords..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription" className="text-sm font-medium text-gray-700">
                      Meta Description
                      <span className="text-xs text-gray-500 ml-2">(max 160 characters)</span>
                    </Label>
                    <Textarea
                      id="metaDescription"
                      placeholder="Brief description for search engine results..."
                      value={formData.metaDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                      maxLength={160}
                    />
                    <div className="text-xs text-gray-500 text-right">
                      {formData.metaDescription.length}/160 characters
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Internal Links</Label>
                      <URLInput
                        urls={formData.internalLinks}
                        onChange={(urls) => setFormData(prev => ({ ...prev, internalLinks: urls }))}
                        placeholder="Add internal links..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">External Links</Label>
                      <URLInput
                        urls={formData.externalLinks}
                        onChange={(urls) => setFormData(prev => ({ ...prev, externalLinks: urls }))}
                        placeholder="Add external links..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageSuggestions" className="text-sm font-medium text-gray-700">Image Suggestions</Label>
                    <Input
                      id="imageSuggestions"
                      placeholder="Keywords for image suggestions or describe desired images..."
                      value={formData.imageSuggestions}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageSuggestions: e.target.value }))}
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Section 4: AI Generation Controls */}
          <Collapsible open={openSections.ai} onOpenChange={() => toggleSection('ai')}>
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      AI Generation Controls
                    </div>
                    {openSections.ai ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700">Creativity Level</Label>
                      <span className="text-sm font-medium text-indigo-600">{formData.creativityLevel[0]}%</span>
                    </div>
                    <Slider
                      value={formData.creativityLevel}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, creativityLevel: value }))}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>More Factual</span>
                      <span>More Creative</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Template</Label>
                      <Select value={formData.template} onValueChange={(value) => setFormData(prev => ({ ...prev, template: value }))}>
                        <SelectTrigger className="border-gray-200">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="listicle">Listicle</SelectItem>
                          <SelectItem value="howto">How-To Guide</SelectItem>
                          <SelectItem value="opinion">Opinion Piece</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="tutorial">Tutorial</SelectItem>
                          <SelectItem value="news">News Article</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Language</Label>
                      <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                        <SelectTrigger className="border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="dutch">Dutch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Include Quotes/Stats</Label>
                      <p className="text-xs text-gray-500">Add relevant quotes and statistics to enhance credibility</p>
                    </div>
                    <Switch
                      checked={formData.includeQuotes}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeQuotes: checked }))}
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Action Buttons */}
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 justify-center">
                {onBack && (
                  <Button
                    onClick={onBack}
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-3 inline-flex items-center gap-2"
                    size="lg"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                  </Button>
                )}
                <Button
                  onClick={() => handleSubmit('generate')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-medium shadow-lg"
                  size="lg"
                >
                  Generate Blog
                </Button>
                <Button
                  onClick={() => handleSubmit('clear')}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 px-6 py-3"
                  size="lg"
                >
                  Clear Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlogFormGenerator;
