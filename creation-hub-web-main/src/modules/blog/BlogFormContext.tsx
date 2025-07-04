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
  finalPrompt?: string;
}

interface BlogFormContextType {
  formData: BlogFormData | null;
  setFormData: (data: BlogFormData) => void;
  resetFormData: () => void;
  // Smart button logic state
  hasGeneratedOnce: boolean;
  hasGeneratedInThisSession: boolean;
  lastGeneratedPrompt: string;
  lastGeneratedFormData: BlogFormData | null;
  isComingFromValidation: boolean;
  generatedPrompt: string;
  currentFormState: BlogFormData;
  // Smart button logic functions
  markAsGenerated: (prompt: string, formData: BlogFormData) => void;
  setComingFromValidation: (value: boolean) => void;
  resetSession: () => void;
  setGeneratedPrompt: (prompt: string) => void;
  hasFormDataChanged: () => boolean;
  clearGeneratedContent: () => void;
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
  finalPrompt: '',
};

const BlogFormContext = createContext<BlogFormContextType | undefined>(undefined);

export const BlogFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formData, setFormDataState] = useState<BlogFormData | null>(null);
  
  // Smart button logic state
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [hasGeneratedInThisSession, setHasGeneratedInThisSession] = useState(false);
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState("");
  const [lastGeneratedFormData, setLastGeneratedFormData] = useState<BlogFormData | null>(null);
  const [isComingFromValidation, setIsComingFromValidation] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [currentFormState, setCurrentFormState] = useState<BlogFormData>(defaultFormData);

  const setFormData = (data: BlogFormData) => {
    setFormDataState(data);
  };

  const resetFormData = () => {
    setFormDataState(defaultFormData);
  };

  // Smart button logic functions
  const markAsGenerated = (prompt: string, formDataUsed: BlogFormData) => {
    setLastGeneratedPrompt(prompt);
    setLastGeneratedFormData(formDataUsed);
    setHasGeneratedOnce(true);
    setHasGeneratedInThisSession(true);
    setGeneratedPrompt(prompt);
    setCurrentFormState(formDataUsed);
  };

  const setComingFromValidation = (value: boolean) => {
    setIsComingFromValidation(value);
  };

  const resetSession = () => {
    setHasGeneratedInThisSession(false);
    setIsComingFromValidation(false);
  };

  const clearGeneratedContent = () => {
    // Clear the generated content when form data changes
    if (formData) {
      setFormDataState(prev => prev ? ({ ...prev, webhookResponse: '' }) : null);
    }
  };

  // Function to check if current form data is different from last generated
  const hasFormDataChanged = (): boolean => {
    if (!lastGeneratedFormData || !formData) return true;
    
    // Compare all relevant form fields that affect prompt generation
    return (
      formData.title !== lastGeneratedFormData.title ||
      formData.targetAudience !== lastGeneratedFormData.targetAudience ||
      formData.primaryGoal !== lastGeneratedFormData.primaryGoal ||
      formData.toneOfVoice !== lastGeneratedFormData.toneOfVoice ||
      formData.wordCountRange !== lastGeneratedFormData.wordCountRange ||
      formData.callToAction !== lastGeneratedFormData.callToAction ||
      JSON.stringify(formData.categories) !== JSON.stringify(lastGeneratedFormData.categories) ||
      JSON.stringify(formData.tags) !== JSON.stringify(lastGeneratedFormData.tags) ||
      JSON.stringify(formData.referenceUrls) !== JSON.stringify(lastGeneratedFormData.referenceUrls) ||
      formData.outline !== lastGeneratedFormData.outline ||
      formData.seoTitle !== lastGeneratedFormData.seoTitle ||
      formData.metaDescription !== lastGeneratedFormData.metaDescription ||
      JSON.stringify(formData.focusKeywords) !== JSON.stringify(lastGeneratedFormData.focusKeywords) ||
      JSON.stringify(formData.internalLinks) !== JSON.stringify(lastGeneratedFormData.internalLinks) ||
      JSON.stringify(formData.externalLinks) !== JSON.stringify(lastGeneratedFormData.externalLinks) ||
      formData.imageSuggestions !== lastGeneratedFormData.imageSuggestions ||
      JSON.stringify(formData.creativityLevel) !== JSON.stringify(lastGeneratedFormData.creativityLevel) ||
      formData.template !== lastGeneratedFormData.template ||
      formData.language !== lastGeneratedFormData.language ||
      formData.includeQuotes !== lastGeneratedFormData.includeQuotes ||
      formData.finalPrompt !== lastGeneratedFormData.finalPrompt
    );
  };

  const contextValue: BlogFormContextType = {
    formData,
    setFormData,
    resetFormData,
    hasGeneratedOnce,
    hasGeneratedInThisSession,
    lastGeneratedPrompt,
    lastGeneratedFormData,
    isComingFromValidation,
    generatedPrompt,
    currentFormState,
    markAsGenerated,
    setComingFromValidation,
    resetSession,
    setGeneratedPrompt,
    hasFormDataChanged,
    clearGeneratedContent
  };

  return (
    <BlogFormContext.Provider value={contextValue}>
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
