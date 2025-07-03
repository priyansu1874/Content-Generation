import React, { useState } from 'react';
import BlogFormGenerator from './BlogFormGenerator';
import FinalPrompt from './FinalPrompt';
import ContentValidation from './ContentValidation';
import { useBlogForm } from './BlogFormContext';

type PageStep = 'form' | 'prompt' | 'validation';

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

const BlogGenerator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<PageStep>('form');
  const { formData, setFormData, resetFormData } = useBlogForm();
  const [finalPrompt, setFinalPrompt] = useState<string>('');

  const handleFormNext = (data: BlogFormData) => {
    setFormData(data);
    setCurrentStep('prompt');
  };

  const handlePromptBack = () => {
    setCurrentStep('form');
  };

  const handlePromptSubmit = (prompt: string) => {
    setFinalPrompt(prompt);
    setCurrentStep('validation');
  };

  const handleValidationBack = () => {
    setCurrentStep('prompt');
  };

  const handlePost = () => {
    // Handle successful posting - could redirect to dashboard or show success message
    alert('Blog posted successfully!');
    // Reset to form for new blog
    setCurrentStep('form');
    resetFormData();
    setFinalPrompt('');
  };

  switch (currentStep) {
    case 'form':
      return <BlogFormGenerator onNext={handleFormNext} initialFormData={formData} />;
    case 'prompt':
      return (
        <FinalPrompt
          onBack={handlePromptBack}
          onSubmitForApproval={handlePromptSubmit}
          formData={formData}
        />
      );
    case 'validation':
      return (
        <ContentValidation
          onBack={handleValidationBack}
          onPost={handlePost}
          prompt={finalPrompt}
        />
      );
    default:
      return <BlogFormGenerator onNext={handleFormNext} />;
  }
};

export default BlogGenerator;
