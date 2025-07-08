import React, { createContext, useContext, useState } from 'react';
import type { FormData } from './LinkedInAutomationForm';

type LinkedInFormContextType = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  // Smart button logic state
  hasGeneratedOnce: boolean;
  hasGeneratedInThisSession: boolean;
  lastGeneratedPrompt: string;
  lastGeneratedFormData: FormData | null;
  isComingFromValidation: boolean;
  generatedPrompt: string;
  currentFormState: FormData;
  // Smart button logic functions
  markAsGenerated: (prompt: string, formData: FormData) => void;
  setComingFromValidation: (value: boolean) => void;
  resetSession: () => void;
  setGeneratedPrompt: (prompt: string) => void;
  hasFormDataChanged: () => boolean;
  clearGeneratedContent: () => void;
};

const defaultFormData: FormData = {
  title: '',
  description: '',
  specialInstructions: '',
  tone: 'Professional',
  targetAudience: '',
  postAs: 'individual',
  companyName: '',
  mediaOption: 'none',
  mediaUrl: '',
  includeCTA: 'no',
  includeAnalytics: 'no',
  includeHashtags: 'no',
  persona: 'Founder',
  postLength: 'Medium',
  postType: 'Text',
  finalPrompt: '',
  generatedContent: '',
  approvalResponse: ''
};

const LinkedInFormContext = createContext<LinkedInFormContextType | undefined>(undefined);

export const LinkedInFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  
  // Smart button logic state
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [hasGeneratedInThisSession, setHasGeneratedInThisSession] = useState(false);
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState("");
  const [lastGeneratedFormData, setLastGeneratedFormData] = useState<FormData | null>(null);
  const [isComingFromValidation, setIsComingFromValidation] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [currentFormState, setCurrentFormState] = useState<FormData>(defaultFormData);

  // Smart button logic functions
  const markAsGenerated = (prompt: string, formDataUsed: FormData) => {
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
    setFormData(prev => ({ ...prev, approvalResponse: '' }));
  };

  // Function to check if current form data is different from last generated
  const hasFormDataChanged = (): boolean => {
    if (!lastGeneratedFormData) return true;
    
    // Compare all relevant form fields that affect prompt generation
    return (
      formData.title !== lastGeneratedFormData.title ||
      formData.description !== lastGeneratedFormData.description ||
      formData.specialInstructions !== lastGeneratedFormData.specialInstructions ||
      formData.tone !== lastGeneratedFormData.tone ||
      formData.targetAudience !== lastGeneratedFormData.targetAudience ||
      formData.postAs !== lastGeneratedFormData.postAs ||
      formData.companyName !== lastGeneratedFormData.companyName ||
      formData.mediaOption !== lastGeneratedFormData.mediaOption ||
      formData.mediaUrl !== lastGeneratedFormData.mediaUrl ||
      formData.includeCTA !== lastGeneratedFormData.includeCTA ||
      formData.includeAnalytics !== lastGeneratedFormData.includeAnalytics ||
      formData.includeHashtags !== lastGeneratedFormData.includeHashtags ||
      formData.persona !== lastGeneratedFormData.persona ||
      formData.postLength !== lastGeneratedFormData.postLength ||
      formData.postType !== lastGeneratedFormData.postType
    );
  };

  const contextValue: LinkedInFormContextType = {
    formData,
    setFormData,
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
    <LinkedInFormContext.Provider value={contextValue}>
      {children}
    </LinkedInFormContext.Provider>
  );
};

export const useLinkedInFormContext = () => {
  const ctx = useContext(LinkedInFormContext);
  if (!ctx) throw new Error("useLinkedInFormContext must be used within LinkedInFormProvider");
  return ctx;
};
     