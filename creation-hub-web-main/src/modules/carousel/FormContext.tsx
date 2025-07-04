import React, { createContext, useContext, useState } from "react";

export interface FormData {
  topic: string;
  objective: string;
  targetAudience: string;
  slideCount: number;
  headline: string;
  keyPoints: string;
  callToAction: string;
  platform: string;
  tone: string;
  textLength: string;
}

type FormContextType = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  // Smart button logic state
  hasGeneratedOnce: boolean;
  hasGeneratedInThisSession: boolean;
  lastGeneratedPrompt: string;
  lastGeneratedFormData: FormData | null;
  isComingFromValidation: boolean;
  generatedContent: string;
  currentPrompt: string;
  // Smart button logic functions
  markAsGenerated: (prompt: string, content: string, formData: FormData) => void;
  setComingFromValidation: (value: boolean) => void;
  setPrompt: (prompt: string) => void;
  resetSession: () => void;
  setGeneratedContent: (content: string) => void;
  hasFormDataChanged: () => boolean;
};

const defaultFormData: FormData = {
  topic: "",
  objective: "",
  targetAudience: "",
  slideCount: 5,
  headline: "",
  keyPoints: "",
  callToAction: "",
  platform: "",
  tone: "",
  textLength: ""
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  
  // Smart button logic state
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [hasGeneratedInThisSession, setHasGeneratedInThisSession] = useState(false);
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState("");
  const [lastGeneratedFormData, setLastGeneratedFormData] = useState<FormData | null>(null);
  const [isComingFromValidation, setIsComingFromValidation] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");

  // Smart button logic functions
  const markAsGenerated = (prompt: string, content: string, formDataUsed: FormData) => {
    setLastGeneratedPrompt(prompt);
    setLastGeneratedFormData(formDataUsed);
    setHasGeneratedOnce(true);
    setHasGeneratedInThisSession(true);
    setGeneratedContent(content);
  };

  const setComingFromValidation = (value: boolean) => {
    setIsComingFromValidation(value);
    // Don't automatically sync prompts here - let the component handle it
  };

  const setPrompt = (prompt: string) => {
    setCurrentPrompt(prompt);
  };

  const resetSession = () => {
    setHasGeneratedInThisSession(false);
    setIsComingFromValidation(false);
  };

  // Function to check if current form data is different from last generated
  const hasFormDataChanged = (): boolean => {
    if (!lastGeneratedFormData) return true;
    
    // Compare all relevant form fields
    return (
      formData.topic !== lastGeneratedFormData.topic ||
      formData.objective !== lastGeneratedFormData.objective ||
      formData.targetAudience !== lastGeneratedFormData.targetAudience ||
      formData.slideCount !== lastGeneratedFormData.slideCount ||
      formData.headline !== lastGeneratedFormData.headline ||
      formData.keyPoints !== lastGeneratedFormData.keyPoints ||
      formData.callToAction !== lastGeneratedFormData.callToAction ||
      formData.platform !== lastGeneratedFormData.platform ||
      formData.tone !== lastGeneratedFormData.tone ||
      formData.textLength !== lastGeneratedFormData.textLength
    );
  };

  const contextValue: FormContextType = {
    formData,
    setFormData,
    hasGeneratedOnce,
    hasGeneratedInThisSession,
    lastGeneratedPrompt,
    lastGeneratedFormData,
    isComingFromValidation,
    generatedContent,
    currentPrompt,
    markAsGenerated,
    setComingFromValidation,
    setPrompt,
    resetSession,
    setGeneratedContent,
    hasFormDataChanged
  };

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("useFormContext must be used within FormProvider");
  return ctx;
};
