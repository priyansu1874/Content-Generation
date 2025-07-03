import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  webhookResponse?: string;
}

interface BlogFormContextType {
  formData: BlogFormData | null;
  setFormData: (data: BlogFormData) => void;
  resetFormData: () => void;
}

const defaultFormData: BlogFormData = {
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
};

const BlogFormContext = createContext<BlogFormContextType | undefined>(undefined);

export const BlogFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formData, setFormDataState] = useState<BlogFormData | null>(null);

  const setFormData = (data: BlogFormData) => {
    setFormDataState(data);
  };

  const resetFormData = () => {
    setFormDataState(defaultFormData);
  };

  return (
    <BlogFormContext.Provider value={{ formData, setFormData, resetFormData }}>
      {children}
    </BlogFormContext.Provider>
  );
};

export const useBlogForm = () => {
  const context = useContext(BlogFormContext);
  if (context === undefined) {
    throw new Error('useBlogForm must be used within a BlogFormProvider');
  }
  return context;
};
