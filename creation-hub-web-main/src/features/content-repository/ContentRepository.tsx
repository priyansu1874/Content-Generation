import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Heading1, Heading3, Heading4 } from '@/shared/components/typography';
import { ArrowLeft, Search, Filter, Calendar, ArrowUpDown, X, Globe, Linkedin, Mail, FileText, Facebook, Image, Twitter, Brain } from 'lucide-react';
import { supabase } from '@/config/supabaseClient';
import DOMPurify from 'dompurify';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  status: 'draft' | 'published' | 'in-progress';
  author: string;
}

const ContentRepository = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  // Remove content table from repository
  const [blogContent, setBlogContent] = useState<ContentItem[]>([]);
  const [linkedinContent, setLinkedinContent] = useState<ContentItem[]>([]);
  const [technicalArticleContent, setTechnicalArticleContent] = useState<ContentItem[]>([]);
  const [viewItem, setViewItem] = useState<Record<string, unknown> | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Function to get icon based on content type
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'Website Blog':
        return Globe;
      case 'Content Post Information':
        return Linkedin;
      case 'Technical Article Content':
        return FileText;
      case 'Carousel':
        return Image;
      case 'Newsletter':
        return Mail;
      case 'Facebook Post':
        return Facebook;
      case 'Twitter Post':
        return Twitter;
      case 'Thought Leadership':
        return Brain;
      default:
        return FileText;
    }
  };

  // Fetch data from Supabase for all modules
  useEffect(() => {
    // Helper to map table name to type
    const tableTypeMap = {
      'website_blog': 'Website Blog',
      'Content Post Information': 'Content Post Information',
      'technical_article_content': 'Technical Article Content',
    };

    const fetchBlogContent = async () => {
      const { data, error } = await supabase.from('website_blog').select('*');
      if (!error) setBlogContent((data || []).map(row => ({
        ...row,
        type: tableTypeMap['website_blog'],
        createdAt: row.createdAt || row.created_at || '',
      })));
    };
    
    const fetchLinkedinContent = async () => {
      const { data, error } = await supabase.from('Content Post Information').select('*');
      if (!error) setLinkedinContent((data || []).map(row => ({
        ...row,
        type: tableTypeMap['Content Post Information'],
        createdAt: row.createdAt || row.created_at || '',
      })));
    };
    
    const fetchTechnicalArticleContent = async () => {
      const { data, error } = await supabase.from('technical_article_content').select('*');
      if (!error) setTechnicalArticleContent((data || []).map(row => ({
        ...row,
        type: tableTypeMap['technical_article_content'],
        createdAt: row.createdAt || row.created_at || '',
      })));
    };
    
    fetchBlogContent();
    fetchLinkedinContent();
    fetchTechnicalArticleContent();
  }, []);

  const contentTypes = ['Website Blog', 'LinkedIn Post', 'Newsletter', 'Technical Article', 'Facebook Post', 'Carousel', 'Twitter Post', 'Thought Leadership'];

  // Combine all fetched content into one array
  const allContent = [
    ...blogContent,
    ...linkedinContent,
    ...technicalArticleContent
  ];

  const filteredAndSortedContent = allContent
    .filter(item => {
      if (!item || typeof item.title !== 'string' || typeof item.type !== 'string') return false;
      return (
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedTypes.length === 0 || selectedTypes.includes(item.type))
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'date':
        default:
          comparison = a.createdAt && b.createdAt ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() : 0;
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const handleTypeFilter = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes(prev => [...prev, type]);
    } else {
      setSelectedTypes(prev => prev.filter(t => t !== type));
    }
  };

  const handleSort = (field: 'date' | 'title' | 'type') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Content renderers based on actual database columns - SHOWING ALL COLUMNS
  const ContentRenderers = {
    'Website Blog': (item: Record<string, unknown>) => {
      // ALL Columns: id, title, Slug, metaTitle, metaDescription, introduction, body, callToAction, Propmt, quote, Tags, generatedContent, conclusion, created_at
      const title = item.title as string;
      const slug = item.Slug as string;
      const metaTitle = item.metaTitle as string;
      const metaDescription = item.metaDescription as string;
      const introduction = item.introduction as string;
      const body = item.body as string;
      const callToAction = item.callToAction as string;
      const prompt = item.Propmt as string; // Note: it's "Propmt" in database
      const quote = item.quote as string;
      const tags = item.Tags as string;
      const generatedContent = item.generatedContent as string;
      const conclusion = item.conclusion as string;
      
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title || 'Untitled Blog'}</h1>
            <div className="flex gap-4 text-sm text-gray-600 mb-4">
              <span>📅 {item.created_at ? new Date(item.created_at as string).toLocaleDateString() : 'No date'}</span>
              <span>🏷️ Blog Post</span>
              {slug && <span>📝 Slug: {slug}</span>}
            </div>
            {metaDescription && (
              <p className="text-lg text-gray-600 italic mb-4">{metaDescription}</p>
            )}
          </div>
          
          {/* Meta Information Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Meta Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-gray-700">Meta Title:</strong>
                <p className="text-gray-600 mt-1">{metaTitle || 'Not set'}</p>
              </div>
              <div>
                <strong className="text-gray-700">Meta Description:</strong>
                <p className="text-gray-600 mt-1">{metaDescription || 'Not set'}</p>
              </div>
              <div>
                <strong className="text-gray-700">Slug:</strong>
                <p className="text-gray-600 mt-1">{slug || 'Not set'}</p>
              </div>
              <div>
                <strong className="text-gray-700">Tags:</strong>
                <div className="mt-1">
                  {tags ? (
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        try {
                          const tagArray = JSON.parse(tags);
                          return Array.isArray(tagArray) ? tagArray.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                              {tag}
                            </Badge>
                          )) : <Badge variant="secondary">{tags}</Badge>;
                        } catch {
                          return <Badge variant="secondary">{tags}</Badge>;
                        }
                      })()}
                    </div>
                  ) : (
                    <span className="text-gray-400">No tags</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Content Sections */}
          <div className="prose prose-lg max-w-none bg-white rounded-lg p-6 shadow-sm">
            {introduction && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h2 className="text-2xl font-bold text-green-800 mb-3">Introduction</h2>
                <p className="text-green-700 leading-relaxed">{introduction}</p>
              </div>
            )}
            
            {body && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Main Content</h2>
                <div className="text-gray-700 prose max-w-none">
                  {(() => {
                    try {
                      const bodyContent = JSON.parse(body);
                      if (Array.isArray(bodyContent)) {
                        return bodyContent.map((section: any, index: number) => (
                          <div key={index} className="mb-4 p-3 border-l-4 border-blue-300 bg-blue-50">
                            {section.title && <h3 className="text-xl font-semibold mb-2 text-blue-800">{section.title}</h3>}
                            {section.text && <p className="leading-relaxed text-blue-700">{section.text}</p>}
                            {section.content && <p className="leading-relaxed text-blue-700">{section.content}</p>}
                          </div>
                        ));
                      }
                      return <div className="p-4 bg-gray-100 rounded-lg"><pre className="whitespace-pre-wrap text-sm">{JSON.stringify(bodyContent, null, 2)}</pre></div>;
                    } catch {
                      return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }} />;
                    }
                  })()}
                </div>
              </div>
            )}
            
            {quote && (
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200 border-l-4 border-l-yellow-500">
                <h2 className="text-xl font-bold text-yellow-800 mb-2">Quote</h2>
                <blockquote className="text-yellow-700 italic text-lg">"{quote}"</blockquote>
              </div>
            )}
            
            {callToAction && (
              <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h2 className="text-xl font-bold text-orange-800 mb-2">Call to Action</h2>
                <p className="text-orange-700">{callToAction}</p>
              </div>
            )}
            
            {conclusion && (
              <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h2 className="text-xl font-bold text-indigo-800 mb-2">Conclusion</h2>
                <div className="text-indigo-700">
                  {(() => {
                    try {
                      const conclusionContent = JSON.parse(conclusion);
                      if (typeof conclusionContent === 'object' && conclusionContent !== null) {
                        return <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border">{JSON.stringify(conclusionContent, null, 2)}</pre>;
                      }
                      return <p className="leading-relaxed">{conclusionContent}</p>;
                    } catch {
                      return <p className="leading-relaxed whitespace-pre-wrap">{conclusion}</p>;
                    }
                  })()}
                </div>
              </div>
            )}
            
            {generatedContent && (
              <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h2 className="text-xl font-bold text-purple-800 mb-2">Generated Content</h2>
                <div className="text-purple-700">
                  {(() => {
                    try {
                      const content = JSON.parse(generatedContent);
                      return <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border">{JSON.stringify(content, null, 2)}</pre>;
                    } catch {
                      return <div className="whitespace-pre-wrap">{generatedContent}</div>;
                    }
                  })()}
                </div>
              </div>
            )}
            
            {prompt && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Original Prompt</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{prompt}</p>
              </div>
            )}
          </div>
        </div>
      );
    },

    'Content Post Information': (item: Record<string, unknown>) => {
      // ALL Columns: id, Post Description, Special Instructions, title, Target Audience, Persona, Post Length, Content Tone, Include CTA, Add Summary Analytics, Include Hashtags, Image Url, Main Prompt, Posted As, created_at
      const postDescription = item['Post Description'] as string;
      const specialInstructions = item['Special Instructions'] as string;
      const title = item.title as string;
      const targetAudience = item['Target Audience'] as string;
      const persona = item.Persona as string;
      const postLength = item['Post Length'] as string;
      const contentTone = item['Content Tone'] as string;
      const includeCTA = item['Include CTA'] as string;
      const addSummaryAnalytics = item['Add Summary Analytics'] as string;
      const includeHashtags = item['Include Hashtags'] as string;
      const imageUrl = item['Image Url'] as string;
      const mainPrompt = item['Main Prompt'] as string;
      const postedAs = item['Posted As'] as string;
      
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">LinkedIn Post: {title || 'Untitled'}</h2>
            <div className="flex gap-4 text-sm text-gray-600 mb-4">
              <span>📅 {item.created_at ? new Date(item.created_at as string).toLocaleDateString() : 'No date'}</span>
              <span>👥 {targetAudience || 'Professional'}</span>
              <span>🎨 {contentTone || 'Professional'}</span>
            </div>
          </div>
          
          {/* Post Configuration */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Post Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <strong className="text-gray-700">Target Audience:</strong>
                <p className="text-gray-600 mt-1">{targetAudience || 'Not specified'}</p>
              </div>
              <div>
                <strong className="text-gray-700">Persona:</strong>
                <p className="text-gray-600 mt-1">{persona || 'Not specified'}</p>
              </div>
              <div>
                <strong className="text-gray-700">Post Length:</strong>
                <p className="text-gray-600 mt-1">{postLength || 'Not specified'}</p>
              </div>
              <div>
                <strong className="text-gray-700">Content Tone:</strong>
                <p className="text-gray-600 mt-1">{contentTone || 'Not specified'}</p>
              </div>
              <div>
                <strong className="text-gray-700">Posted As:</strong>
                <p className="text-gray-600 mt-1">{postedAs || 'Not specified'}</p>
              </div>
              <div>
                <strong className="text-gray-700">Include CTA:</strong>
                <Badge variant={includeCTA === 'Yes' ? 'default' : 'secondary'}>
                  {includeCTA || 'Not specified'}
                </Badge>
              </div>
              <div>
                <strong className="text-gray-700">Include Hashtags:</strong>
                <Badge variant={includeHashtags === 'Yes' ? 'default' : 'secondary'}>
                  {includeHashtags || 'Not specified'}
                </Badge>
              </div>
              <div>
                <strong className="text-gray-700">Summary Analytics:</strong>
                <Badge variant={addSummaryAnalytics === 'Yes' ? 'default' : 'secondary'}>
                  {addSummaryAnalytics || 'Not specified'}
                </Badge>
              </div>
              <div>
                <strong className="text-gray-700">Image URL:</strong>
                <p className="text-gray-600 mt-1 break-all">{imageUrl || 'No image'}</p>
              </div>
            </div>
          </div>
          
          {/* LinkedIn-style post preview */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm max-w-2xl">
            <div className="p-6">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {persona ? persona.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {persona || 'Your Name'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {targetAudience || 'Professional'} • Now
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-gray-900 whitespace-pre-line leading-relaxed">
                  {postDescription || 'No content available.'}
                </div>
              </div>

              {imageUrl && (
                <div className="mb-4">
                  <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
                    📷 Image attachment: {imageUrl}
                  </div>
                </div>
              )}

              <div className="border-t pt-3">
                <div className="flex items-center justify-between text-gray-500">
                  <span className="flex items-center space-x-2">
                    <span>👍</span>
                    <span>Like</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <span>💬</span>
                    <span>Comment</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <span>🔄</span>
                    <span>Repost</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <span>📤</span>
                    <span>Send</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Information */}
          {(specialInstructions || mainPrompt) && (
            <div className="bg-gray-50 rounded-lg p-6 border">
              <h3 className="font-semibold text-gray-800 mb-4">Additional Information</h3>
              {specialInstructions && (
                <div className="mb-4">
                  <strong className="text-gray-700">Special Instructions:</strong>
                  <p className="text-gray-600 mt-1 whitespace-pre-wrap">{specialInstructions}</p>
                </div>
              )}
              {mainPrompt && (
                <div>
                  <strong className="text-gray-700">Main Prompt:</strong>
                  <p className="text-gray-600 mt-1 whitespace-pre-wrap">{mainPrompt}</p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    },

    'Technical Article Content': (item: Record<string, unknown>) => {
      // ALL Columns: id, organizationName, title, targetAudience, technologyFocus, toneOfArticle, articleObjective, keywords, authorName, exampleReference, prompt, generatedContent, created_at
      const organizationName = item.organizationName as string;
      const title = item.title as string;
      const targetAudience = item.targetAudience as string;
      const technologyFocus = item.technologyFocus as string;
      const toneOfArticle = item.toneOfArticle as string;
      const articleObjective = item.articleObjective as string;
      const keywords = item.keywords as string;
      const authorName = item.authorName as string;
      const exampleReference = item.exampleReference as string;
      const prompt = item.prompt as string;
      const generatedContent = item.generatedContent as string;
      
      const extractValue = (field: string, value: string) => {
        const regex = new RegExp(`^${field.replace(/_/g, ' ')}:?\\s*`, 'i');
        return value.replace(regex, '').trim();
      };

      let contentObj: any = null;
      try {
        if (generatedContent) {
          contentObj = JSON.parse(generatedContent);
        }
      } catch {
        // Content is not JSON, use as plain text
      }

      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{title || 'Untitled Article'}</h2>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>📅 {item.created_at ? new Date(item.created_at as string).toLocaleDateString() : 'No date'}</span>
                  <span>🏢 {organizationName || 'No organization'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{toneOfArticle || 'No tone'}</Badge>
              </div>
            </div>
          </div>
          
          {/* Article Metadata */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Article Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <strong className="text-gray-700">Organization:</strong>
                <p className="text-gray-600 mt-1">{organizationName || 'Not specified'}</p>
              </div>
              <div>
                <strong className="text-gray-700">Author:</strong>
                <p className="text-gray-600 mt-1">{authorName || 'Not specified'}</p>
              </div>
              <div>
                <strong className="text-gray-700">Target Audience:</strong>
                <p className="text-gray-600 mt-1">
                  {(() => {
                    try {
                      if (targetAudience) {
                        const audienceArray = JSON.parse(targetAudience);
                        return Array.isArray(audienceArray) ? audienceArray.join(', ') : targetAudience;
                      }
                      return 'Not specified';
                    } catch {
                      return targetAudience || 'Not specified';
                    }
                  })()}
                </p>
              </div>
              <div>
                <strong className="text-gray-700">Technology Focus:</strong>
                <p className="text-gray-600 mt-1">
                  {(() => {
                    try {
                      if (technologyFocus) {
                        const techArray = JSON.parse(technologyFocus);
                        return Array.isArray(techArray) ? techArray.join(', ') : technologyFocus;
                      }
                      return 'Not specified';
                    } catch {
                      return technologyFocus || 'Not specified';
                    }
                  })()}
                </p>
              </div>
              <div>
                <strong className="text-gray-700">Keywords:</strong>
                <p className="text-gray-600 mt-1">
                  {(() => {
                    try {
                      if (keywords) {
                        const keywordArray = JSON.parse(keywords);
                        return Array.isArray(keywordArray) ? keywordArray.join(', ') : keywords;
                      }
                      return 'Not specified';
                    } catch {
                      return keywords || 'Not specified';
                    }
                  })()}
                </p>
              </div>
              <div>
                <strong className="text-gray-700">Tone:</strong>
                <p className="text-gray-600 mt-1">{toneOfArticle || 'Not specified'}</p>
              </div>
            </div>
            
            {articleObjective && (
              <div className="mt-6">
                <strong className="text-gray-700">Article Objective:</strong>
                <p className="text-gray-600 mt-1 whitespace-pre-wrap">{articleObjective}</p>
              </div>
            )}
            
            {exampleReference && (
              <div className="mt-6">
                <strong className="text-gray-700">Example Reference:</strong>
                <p className="text-gray-600 mt-1 whitespace-pre-wrap">{exampleReference}</p>
              </div>
            )}
          </div>
          
          {/* Generated Content */}
          <div className="prose prose-slate max-w-none bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Generated Article</h3>
            {contentObj ? (
              <div>
                {contentObj.title && (
                  <h1 className="text-4xl font-extrabold text-slate-900 mb-6">{extractValue('title', contentObj.title)}</h1>
                )}
                {contentObj.introduction && (
                  <section className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h2 className="text-2xl font-bold text-green-800 mb-3">Introduction</h2>
                    <div className="text-green-700 leading-relaxed whitespace-pre-wrap">{extractValue('introduction', contentObj.introduction)}</div>
                  </section>
                )}
                {contentObj.background && (
                  <section className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h2 className="text-2xl font-bold text-blue-800 mb-3">Background</h2>
                    <div className="text-blue-700 leading-relaxed whitespace-pre-wrap">{extractValue('background', contentObj.background)}</div>
                  </section>
                )}
                {contentObj.technology_focus && (
                  <section className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h2 className="text-2xl font-bold text-purple-800 mb-3">Technology Focus</h2>
                    <div className="text-purple-700 leading-relaxed whitespace-pre-wrap">{extractValue('technology focus', contentObj.technology_focus)}</div>
                  </section>
                )}
                {contentObj.use_case && (
                  <section className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h2 className="text-2xl font-bold text-orange-800 mb-3">Use Case</h2>
                    <div className="text-orange-700 leading-relaxed whitespace-pre-wrap">{extractValue('use case', contentObj.use_case)}</div>
                  </section>
                )}
                {contentObj.business_benefits && (
                  <section className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h2 className="text-2xl font-bold text-yellow-800 mb-3">Business Benefits</h2>
                    <div className="text-yellow-700 leading-relaxed whitespace-pre-wrap">{extractValue('business benefits', contentObj.business_benefits)}</div>
                  </section>
                )}
                {contentObj.considerations && (
                  <section className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                    <h2 className="text-2xl font-bold text-red-800 mb-3">Considerations</h2>
                    <div className="text-red-700 leading-relaxed whitespace-pre-wrap">{extractValue('considerations', contentObj.considerations)}</div>
                  </section>
                )}
                {contentObj.conclusion && (
                  <section className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Conclusion</h2>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{extractValue('conclusion', contentObj.conclusion)}</div>
                  </section>
                )}
              </div>
            ) : (
              <div className="text-slate-700 p-4 bg-gray-50 rounded-lg">
                {generatedContent ? (
                  <div className="whitespace-pre-wrap">{generatedContent}</div>
                ) : (
                  <p className="text-gray-500 italic">No content generated yet.</p>
                )}
              </div>
            )}
          </div>
          
          {/* Original Prompt */}
          {prompt && (
            <div className="bg-gray-50 rounded-lg p-6 border">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Original Prompt</h3>
              <div className="text-gray-700 whitespace-pre-wrap p-4 bg-white rounded border">{prompt}</div>
            </div>
          )}
        </div>
      );
    },

    // Default fallback renderer for unknown types
    default: (item: Record<string, unknown>) => {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{(item.title as string) || 'Content'}</h2>
            <div className="flex gap-4 text-sm text-gray-600 mb-4">
              <span>📅 {item.created_at ? new Date(item.created_at as string).toLocaleDateString() : 'No date'}</span>
              <span>📄 {(item.type as string) || 'Content'}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {Object.entries(item).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-1 bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <span className="font-semibold text-gray-700 text-base capitalize mb-1 tracking-wide">{key.replace(/_/g, ' ')}</span>
                <span className="text-gray-900 text-sm break-words">
                  {key.toLowerCase().includes('date') || key.toLowerCase().includes('created')
                    ? (value ? new Date(value as string).toLocaleString() : '-')
                    : typeof value === 'boolean'
                      ? value ? 'Yes' : 'No'
                      : value === null || value === undefined || value === ''
                        ? '-'
                        : typeof value === 'object'
                          ? <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto max-w-full whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                          : value.toString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col items-center gap-4 mb-8 text-center">
        <Heading1 className="text-3xl font-bold text-gray-900">
          Content Repository
        </Heading1>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        {/* Search and Sort Controls */}
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2"
                size="sm"
              >
                <Filter className="h-4 w-4" />
                Filters
                {selectedTypes.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedTypes.length}
                  </Badge>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleSort('date')}
                className="flex items-center gap-2"
                size="sm"
              >
                <Calendar className="h-4 w-4" />
                Date
                <ArrowUpDown className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSort('title')}
                className="flex items-center gap-2"
                size="sm"
              >
                Title
                <ArrowUpDown className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSort('type')}
                className="flex items-center gap-2"
                size="sm"
              >
                Type
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Collapsible Filter Section */}
        {isFilterOpen && (
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-600" />
                <Heading4 className="font-semibold text-gray-900">Filter by Content Type</Heading4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFilterOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {contentTypes.map(type => (
                <div key={type} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id={type}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={(checked) => 
                      handleTypeFilter(type, checked as boolean)
                    }
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label htmlFor={type} className="text-sm font-medium cursor-pointer select-none">
                    {type}
                  </label>
                </div>
              ))}
            </div>
            
            {selectedTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedTypes.map(type => (
                  <Badge key={type} variant="secondary" className="px-3 py-1">
                    {type}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTypeFilter(type, false)}
                      className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedTypes([])}
                size="sm"
                disabled={selectedTypes.length === 0}
              >
                Clear All
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedTypes(contentTypes)}
                size="sm"
                disabled={selectedTypes.length === contentTypes.length}
              >
                Select All
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Content Items */}
      <div className="space-y-4">
        {filteredAndSortedContent.length === 0 ? (
          <Card className="p-8 text-center flex flex-col items-center justify-center min-h-[120px]">
            <p className="text-gray-500">No content found matching your criteria.</p>
          </Card>
        ) : (
          filteredAndSortedContent.map((item, index) => (
            <Card 
              key={`${item.type}-${item.id}-${index}`} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              cardContent={
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-1">
                        {(() => {
                          const IconComponent = getContentTypeIcon(item.type);
                          return <IconComponent className="h-5 w-5 text-white" />;
                        })()}
                      </div>
                      <div className="flex-1">
                        <Heading3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.title}
                        </Heading3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span>{item.type}</span>
                          <span>•</span>
                          <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={e => { e.stopPropagation(); setViewItem(item as unknown as Record<string, unknown>); }}
                        className="px-4 py-2"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              }
            />
          ))
        )}
        {/* Modal for viewing content with type-specific formatting */}
        {viewItem && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setViewItem(null)}>
            <div
              className="bg-white w-full h-full overflow-hidden relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between px-12 py-8 bg-gradient-to-r from-blue-600 to-cyan-500 border-b border-gray-100 shadow-lg">
                <Heading3 className="text-white text-3xl font-bold">Content Preview</Heading3>
                <button
                  className="text-white hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-white/10"
                  onClick={() => setViewItem(null)}
                  aria-label="Close"
                >
                  <X className="h-8 w-8" />
                </button>
              </div>
              {/* Content Body */}
              <div className="p-12 bg-gray-50 overflow-y-auto h-[calc(100vh-120px)]">
                <div className="max-w-7xl mx-auto">
                  {(() => {
                    const contentType = viewItem.type as string;
                    const renderer = ContentRenderers[contentType as keyof typeof ContentRenderers] || ContentRenderers.default;
                    return renderer(viewItem);
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Back to Dashboard Button - Bottom Center */}
      <div className="flex justify-center mt-8 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ContentRepository;
