import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowLeft, FileCheck, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DownloadDocxButton from './DownloadDocxButton';

interface ContentValidationProps {
  onBack: () => void;
  onPost: () => void;
  prompt: string;
}

const ContentValidation: React.FC<ContentValidationProps> = ({ onBack, onPost, prompt }) => {
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [postSuccess, setPostSuccess] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setGeneratedContent(prompt);
    let blogHtml = '';

    function renderBlog(json: any) {
      const data = json || {};
      const meta = data.meta || {};
      const blog = data.blog || {};
      const intro = blog.intro || '';
      const conclusion = blog.conclusion || '';
      const cta = blog.cta || '';
      const quotes = blog.quotes || blog.quote || data.quotes || data.quote || [];
      // Ensure quotes is always an array
      const quotesArray = Array.isArray(quotes) ? quotes : (quotes ? [quotes] : []);
      const tags = Array.isArray(data.tags) ? data.tags : [];

      // We'll only keep the metaInfoHtml declaration at the end of the function

      const thumbnail = meta.thumbnail_image
        ? `<img src="${meta.thumbnail_image}" alt="${meta.title || ''}" class="w-full max-h-64 object-cover rounded-xl mb-6" />`
        : '';

      const title = blog.title || meta.title
        ? `<h1 class="text-5xl md:text-6xl font-extrabold mb-4 text-gray-900">${blog.title || meta.title}</h1>`
        : '';

      const description = meta.description
        ? `<div class="text-base md:text-lg italic text-gray-500 mb-4">${meta.description}</div>`
        : '';

      const introHtml = blog.intro
        ? `<p class="text-lg md:text-xl text-gray-800 mb-4">${blog.intro}</p>`
        : '';

      const bodyHtml = (() => {
        // If body is an array of sections
        if (Array.isArray(blog.body)) {
          return blog.body.map(section => {
            // If section is just a string
            if (typeof section === 'string') {
              return `<div class="mb-8">
                <div class="text-lg md:text-xl text-gray-800 leading-7">${section.replace(/\n\n/g, '<br><br>').replace(/\n/g, ' ')}</div>
              </div>`;
            }
            // If section is an object with title, text and subsections
            let sectionHtml = `<div class="mb-8">`;
            if (section.title) {
              sectionHtml += `<h2 class="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900">${section.title}</h2>`;
            }
            if (section.text) {
              sectionHtml += `<div class="text-lg md:text-xl text-gray-800 leading-7 mb-4">${section.text.replace(/\n\n/g, '<br><br>').replace(/\n/g, ' ')}</div>`;
            }
            // Handle subsections
            if (section.subsections && Array.isArray(section.subsections)) {
              sectionHtml += section.subsections.map(subsection => `
                <div class="ml-6 mb-4">
                  ${subsection.subtitle ? `<h3 class="text-2xl md:text-3xl font-bold mb-3 text-gray-800">${subsection.subtitle}</h3>` : ''}
                  ${subsection.text ? `<div class="text-lg md:text-xl text-gray-800 leading-7">${subsection.text.replace(/\n\n/g, '<br><br>').replace(/\n/g, ' ')}</div>` : ''}
                </div>
              `).join('');
            }
            sectionHtml += `</div>`;
            return sectionHtml;
          }).join('');
        }
        // If body is a string
        if (typeof blog.body === 'string') {
          return `<div class="mb-8">
            <div class="text-lg md:text-xl text-gray-800 leading-7">${blog.body.replace(/\n\n/g, '<br><br>').replace(/\n/g, ' ')}</div>
          </div>`;
        }
        // If body is an object with text property
        if (blog.body && typeof blog.body === 'object' && blog.body.text) {
          return `<div class="mb-8">
            <div class="text-lg md:text-xl text-gray-800 leading-7">${blog.body.text.replace(/\n\n/g, '<br><br>').replace(/\n/g, ' ')}</div>
          </div>`;
        }
        return '';
      })();

      const conclusionHtml = blog.conclusion
        ? `<hr class="my-6 border-gray-300" /><p class="text-lg md:text-xl text-gray-900 mb-4">${blog.conclusion}</p>`
        : '';

      const ctaHtml = blog.cta
        ? `<div class="bg-gradient-to-r from-blue-100 to-purple-100 border-l-4 border-blue-400 p-5 rounded-xl font-semibold text-lg md:text-xl text-blue-900 mb-6">
            ${blog.cta}
          </div>`
        : '';

      const tagsHtml = tags.length > 0
        ? `<div class="flex flex-wrap gap-2 mt-2">
            ${tags.map(tag => `<span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">${tag}</span>`).join('')}
          </div>`
        : '';

      // Add quotes section
      const quotesHtml = quotesArray && quotesArray.length > 0
        ? `<div class="mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">Key Quotes & Insights</h2>
            ${quotesArray.map(quote => {
              if (typeof quote === 'string') {
                return `<blockquote class="border-l-4 border-blue-500 pl-6 py-4 mb-4 bg-blue-50 rounded-r-lg">
                  <p class="text-lg italic text-gray-800">"${quote}"</p>
                </blockquote>`;
              } else if (quote && typeof quote === 'object') {
                return `<blockquote class="border-l-4 border-blue-500 pl-6 py-4 mb-4 bg-blue-50 rounded-r-lg">
                  <p class="text-lg italic text-gray-800">"${quote.text || quote.quote || ''}"</p>
                  ${quote.author ? `<cite class="block text-sm text-gray-600 mt-2 font-medium">— ${quote.author}</cite>` : ''}
                  ${quote.source ? `<cite class="block text-xs text-gray-500">${quote.source}</cite>` : ''}
                </blockquote>`;
              }
              return '';
            }).join('')}
          </div>`
        : '';

      // Debug: Let's also check if quotes exist and log them
      if (quotesArray && quotesArray.length > 0) {
        console.log('Found quotes:', quotesArray);
      } else {
        console.log('No quotes found. Blog quotes:', blog.quotes, 'Blog quote:', blog.quote, 'Data quotes:', data.quotes, 'Data quote:', data.quote);
      }

      // Add meta information section
      const metaInfoHtml = `
        <div class="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Meta Information</h2>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-gray-600">Meta Title:</div>
            <div class="font-medium">${meta.title || '-'}</div>
            <div class="text-gray-600">Slug:</div>
            <div class="font-medium">${meta.slug || '-'}</div>
          </div>
        </div>
      `;

      // Format meta information for DOCX export
      const metaInfoForDocx = `META_INFO:Meta Title:${meta.title || '-'} | Slug:${meta.slug || '-'}\n\n`;

      // Add section titles
      const introductionWithTitle = blog.intro
        ? `<div class="mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">Introduction</h2>
            ${introHtml}
          </div>`
        : '';

      const conclusionWithTitle = blog.conclusion
        ? `<div class="mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">Conclusion</h2>
            ${conclusionHtml}
          </div>`
        : '';

      return `
        <article class="max-w-2xl mx-auto px-2 md:px-0">
          ${thumbnail}
          ${title}
          ${metaInfoForDocx}
          ${metaInfoHtml}
          ${description}
          ${introductionWithTitle}
          ${bodyHtml}
          ${quotesHtml}
          ${conclusionWithTitle}
          ${ctaHtml}
          ${tagsHtml}
        </article>
      `;
    }

    try {
      console.log('Raw prompt:', prompt);
      let blogData;
      
      try {
        const firstParse = JSON.parse(prompt);
        console.log('First parse result:', firstParse);
        
        if (!firstParse.output) {
          throw new Error('No output field in parsed JSON');
        }
        
        blogData = JSON.parse(firstParse.output);
      } catch (parseError) {
        // Try parsing the prompt directly as JSON if nested parse fails
        blogData = JSON.parse(prompt);
      }
      
      console.log('Blog data:', blogData);
      console.log('Blog data structure - blog:', blogData.blog);
      console.log('Blog data structure - quotes in blog:', blogData.blog?.quotes);
      console.log('Blog data structure - quotes in root:', blogData.quotes);
      
      if (!blogData || (typeof blogData !== 'object')) {
        throw new Error('Invalid blog data structure');
      }
      
      blogHtml = renderBlog(blogData);
      setFinalPrompt(blogHtml);
    } catch (error) {
      console.error('Error processing blog content:', error);
      setFinalPrompt(`
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error Processing Content</h3>
              <div class="mt-2 text-sm text-red-700">
                ${error.message || 'Unable to parse the blog content. Please check the format and try again.'}
              </div>
            </div>
          </div>
        </div>
      `);
    }

    setIsLoading(false);
  }, [prompt]);

  const handlePost = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://priyansu4781.app.n8n.cloud/webhook/c2b5e08f-51cb-4c94-8ee3-a4276dbc0126', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: generatedContent }),
      });
      if (response.ok) {
        setPostSuccess(true);
      } else {
        alert('Failed to post blog');
      }
    } catch (error) {
      alert('Failed to post blog');
    }
    setIsLoading(false);
  };

  if (postSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">
        <div className="bg-white p-10 rounded-xl shadow-xl text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-4">Your blog is posted!</h2>
          <Button
            onClick={() => navigate('/')}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded"
          >
            Back to Form
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 py-8 px-2">
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Content Validation</h1>
          <p className="text-lg text-gray-600">Review the generated content before publishing</p>
        </div>
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-xl">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <FileCheck className="w-4 h-4 text-white" />
                </span>
                Generated Blog Preview
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                Ready for Review
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="px-6 py-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating content...</p>
                </div>
              ) : finalPrompt ? (
                <div className="prose prose-lg max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(finalPrompt) }} />
                </div>
              ) : (
                <p className="text-red-500 text-center">Failed to generate content. Please try again.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-4 justify-between mt-8">
              <Button
                onClick={onBack}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 px-8 py-4 text-lg font-medium"
                size="lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Prompt
              </Button>
              <div className="flex gap-4">
                <DownloadDocxButton docContent={
                  (() => {
                    try {
                      const parsed = JSON.parse(generatedContent);
                      const blogData = JSON.parse(parsed.output);
                      const blog = blogData.blog;
                      const meta = blogData.meta;

                      // Build formatted content
                      let content = [];

                      // Add title
                      if (blog.title || meta.title) {
                        content.push(`# ${blog.title || meta.title}\n\n`);
                      }

                      // Add meta information
                      content.push(`## Meta Information\n\n`);
                      content.push(`Meta Title: ${meta.title || '-'}\n`);
                      content.push(`Slug: ${meta.slug || '-'}\n\n`);

                      // Add meta description
                      if (meta.description) {
                        content.push(`*${meta.description}*\n\n`);
                      }

                      // Add introduction with title
                      if (blog.intro) {
                        content.push(`## Introduction\n\n`);
                        content.push(`${blog.intro}\n\n`);
                      }

                      // Add body sections
                      if (Array.isArray(blog.body)) {
                        blog.body.forEach(section => {
                          if (typeof section === 'string') {
                            content.push(`${section}\n\n`);
                          } else {
                            // Add section title
                            if (section.title) {
                              content.push(`## ${section.title}\n\n`);
                            }
                            // Add section text
                            if (section.text) {
                              content.push(`${section.text}\n\n`);
                            }
                            // Add subsections
                            if (section.subsections && Array.isArray(section.subsections)) {
                              section.subsections.forEach(subsection => {
                                if (subsection.subtitle) {
                                  content.push(`### ${subsection.subtitle}\n\n`);
                                }
                                if (subsection.text) {
                                  content.push(`${subsection.text}\n\n`);
                                }
                              });
                            }
                          }
                        });
                      } else if (typeof blog.body === 'object' && blog.body.text) {
                        content.push(`${blog.body.text}\n\n`);
                      }

                      // Add quotes section
                      const quotes = blog.quotes || blog.quote || blogData.quotes || blogData.quote || [];
                      // Ensure quotes is always an array
                      const quotesArray = Array.isArray(quotes) ? quotes : (quotes ? [quotes] : []);
                      if (quotesArray && quotesArray.length > 0) {
                        content.push(`## Key Quotes & Insights\n\n`);
                        quotesArray.forEach(quote => {
                          if (typeof quote === 'string') {
                            content.push(`> "${quote}"\n\n`);
                          } else if (quote && typeof quote === 'object') {
                            content.push(`> "${quote.text || quote.quote || ''}"\n`);
                            if (quote.author) {
                              content.push(`> — ${quote.author}\n`);
                            }
                            if (quote.source) {
                              content.push(`> *${quote.source}*\n`);
                            }
                            content.push(`\n`);
                          }
                        });
                        content.push(`\n`);
                      }

                      // Add conclusion with title
                      if (blog.conclusion) {
                        content.push(`## Conclusion\n\n`);
                        content.push(`${blog.conclusion}\n\n`);
                      }

                      // Add CTA
                      if (blog.cta) {
                        content.push(`> ${blog.cta}\n\n`);
                      }

                      // Add tags
                      if (blogData.tags && blogData.tags.length > 0) {
                        content.push(`Tags: ${blogData.tags.join(', ')}`);
                      }

                      return content.join('');
                    } catch (error) {
                      console.error('Error formatting doc content:', error);
                      return generatedContent;
                    }
                  })()
                } />
                <Button
                  onClick={handlePost}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-10 py-4 text-lg font-semibold shadow-xl"
                  size="lg"
                  disabled={isLoading}
                >
                  <Globe className="w-5 h-5 mr-2" />
                  Post Blog
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Back to Dashboard Button */}
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
    </div>
  );
};

export default ContentValidation;
