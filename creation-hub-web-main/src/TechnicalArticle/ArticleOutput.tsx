import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, CheckCircle, Edit3 } from 'lucide-react';
import { FormData } from './types/article';
import { useArticleContext } from './contexts/ArticleContext';

interface ArticleOutputProps {
  article: string;
  formData: FormData;
  onEditPrompt: () => void;
  onBack: () => void;
}

const ArticleOutput: React.FC<ArticleOutputProps> = ({ 
  article, 
  formData, 
  onEditPrompt, 
  onBack 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedArticle, setEditedArticle] = useState(article);
  
  const { setComingFromValidation } = useArticleContext();

  // Handle edit prompt with proper state management
  const handleEditPrompt = () => {
    setComingFromValidation(true);
    onEditPrompt();
  };

  // Download as .doc file with the same format as the article output (HTML-based)
  const handleDownload = () => {
    // Use the same HTML as the article output
    const htmlContent = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${formData.articleTitle}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; margin: 2em; }
          h1 { font-size: 2.25rem; font-weight: 800; margin-bottom: 1.5rem; color: #0f172a; }
          h2 { font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.5rem; color: #1e293b; }
          p, div, section { font-size: 1rem; color: #1e293b; margin-bottom: 1rem; }
          .lead { font-size: 1.125rem; color: #475569; font-style: italic; margin-bottom: 1.5rem; }
          .section { margin-bottom: 2rem; }
        </style>
      </head>
      <body>
        ${extractArticleContent(editedArticle)}
      </body>
      </html>`;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.articleTitle.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleApprove = () => {
    alert('Article approved for posting! This would integrate with your n8n automation pipeline.');
  };

  // Convert markdown to HTML for preview (basic implementation)
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-slate-800 mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold text-slate-700 mb-3 mt-6">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium text-slate-700 mb-2 mt-4">$1</h3>')
      .replace(/^\* (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-2 py-1 rounded text-sm font-mono">$1</code>')
      .replace(/```([^```]+)```/g, '<pre class="bg-slate-100 p-4 rounded-lg overflow-x-auto mt-2 mb-2"><code class="text-sm font-mono">$1</code></pre>')
      .replace(/^\*(.*)\*$/gm, '<em class="italic">$1</em>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '');
  };

  // Convert webhook response to HTML: print all key-value pairs as HTML, convert markdown to HTML, and use key as heading
  function extractArticleContent(article: string): string {
    // Log the full webhook response and its type for debugging
    console.log('Full Webhook Article Response:', article);
    console.log('Webhook Response Type:', typeof article);
    let obj: Record<string, unknown> | null = null;
    if (typeof article === 'string') {
      try {
        obj = JSON.parse(article);
      } catch (e) {
        // If not valid JSON, try to extract JSON substring
        const jsonMatch = article.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            obj = JSON.parse(jsonMatch[0]);
          } catch {
            obj = null;
          }
        }
      }
    } else if (typeof article === 'object' && article !== null) {
      obj = article;
    }
    if (obj && typeof obj === 'object') {
      // If the value itself contains the key name, extract only the value part after the key
      function extractValue(field: string, value: string) {
        // Look for the field name (case-insensitive, with/without colon) at the start
        const regex = new RegExp(`^${field.replace(/_/g, ' ')}:?\\s*`, 'i');
        return value.replace(regex, '').trim();
      }
      let html = '';
      if (typeof obj.title === 'string' && obj.title.trim() !== '') {
        html += `<h1 class="text-4xl font-extrabold text-slate-900 mb-6">${extractValue('title', obj.title)}</h1>`;
      }
      if (typeof obj.meta_description === 'string' && obj.meta_description.trim() !== '') {
        html += `<p class="text-lg text-slate-600 mb-4 italic">${extractValue('meta description', obj.meta_description)}</p>`;
      }
      if (typeof obj.introduction === 'string' && obj.introduction.trim() !== '') {
        html += `<section><h2 class="text-2xl font-bold text-slate-800 mb-2 mt-6">Introduction</h2><div class="mb-4 whitespace-pre-line font-sans text-base text-slate-800">${extractValue('introduction', obj.introduction)}</div></section>`;
      }
      if (typeof obj.background === 'string' && obj.background.trim() !== '') {
        html += `<section><h2 class="text-2xl font-bold text-slate-800 mb-2 mt-6">Background</h2><div class="mb-4 whitespace-pre-line font-sans text-base text-slate-800">${extractValue('background', obj.background)}</div></section>`;
      }
      if (typeof obj.technology_focus === 'string' && obj.technology_focus.trim() !== '') {
        html += `<section><h2 class="text-2xl font-bold text-slate-800 mb-2 mt-6">Technology Focus</h2><div class="mb-4 whitespace-pre-line font-sans text-base text-slate-800">${extractValue('technology focus', obj.technology_focus)}</div></section>`;
      }
      if (typeof obj.use_case === 'string' && obj.use_case.trim() !== '') {
        html += `<section><h2 class="text-2xl font-bold text-slate-800 mb-2 mt-6">Use Case</h2><div class="mb-4 whitespace-pre-line font-sans text-base text-slate-800">${extractValue('use case', obj.use_case)}</div></section>`;
      }
      if (typeof obj.business_benefits === 'string' && obj.business_benefits.trim() !== '') {
        html += `<section><h2 class="text-2xl font-bold text-slate-800 mb-2 mt-6">Business Benefits</h2><div class="mb-4 whitespace-pre-line font-sans text-base text-slate-800">${extractValue('business benefits', obj.business_benefits)}</div></section>`;
      }
      if (typeof obj.considerations === 'string' && obj.considerations.trim() !== '') {
        html += `<section><h2 class="text-2xl font-bold text-slate-800 mb-2 mt-6">Considerations</h2><div class="mb-4 whitespace-pre-line font-sans text-base text-slate-800">${extractValue('considerations', obj.considerations)}</div></section>`;
      }
      if (typeof obj.conclusion === 'string' && obj.conclusion.trim() !== '') {
        html += `<section><h2 class="text-2xl font-bold text-slate-800 mb-2 mt-6">Conclusion</h2><div class="mb-4 whitespace-pre-line font-sans text-base text-slate-800">${extractValue('conclusion', obj.conclusion)}</div></section>`;
      }
      if (typeof obj.call_to_action === 'string' && obj.call_to_action.trim() !== '') {
        html += `<section><h2 class="text-2xl font-bold text-slate-800 mb-2 mt-6">Call to Action</h2><div class="mb-4 whitespace-pre-line font-sans text-base text-slate-800">${extractValue('call to action', obj.call_to_action)}</div></section>`;
      }
      if (!html) {
        html = '<div class="text-slate-500 italic">No article content available.</div>';
      }
      return html;
    }
    return `<div class="whitespace-pre-line font-sans text-base text-slate-800">${article}</div>`;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Article Info Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-500">{formData.organizationName}</Badge>
                Generated Article
              </CardTitle>
              <p className="text-slate-600">Review your generated article and approve for publication</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{formData.technologyFocus}</Badge>
              <Badge variant="outline">{formData.toneOfArticle}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Article Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Article Preview</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? 'Preview' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {isEditing ? (
            <textarea
              value={editedArticle}
              onChange={(e) => setEditedArticle(e.target.value)}
              className="w-full h-96 p-4 border rounded-lg font-mono text-sm resize-y"
              placeholder="Edit your article here..."
            />
          ) : (
            <div 
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: extractArticleContent(editedArticle) 
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Image Gallery */}
      {formData.uploadedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.uploadedImages.map((file, index) => (
                <div key={index} className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center border">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-slate-200 rounded mx-auto mb-2"></div>
                    <p className="text-xs text-slate-600 truncate px-2">{file.name}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-4">
              Images will be automatically integrated into the final article layout
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button variant="outline" onClick={handleEditPrompt} className="flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Edit Prompt Again
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Draft
              </Button>
              <Button 
                onClick={handleApprove}
                className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve for Posting
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Ready for Automation</h3>
              <p className="text-blue-800 text-sm">
                Once approved, this article will be sent to your n8n automation pipeline for publishing across your content channels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticleOutput;
