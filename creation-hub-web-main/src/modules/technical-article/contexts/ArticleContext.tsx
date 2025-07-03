import React, { createContext, useContext, useState, ReactNode } from 'react';

// Utility function to compare form data (ignoring functions and deep comparison)
const areFormDataEqual = (formData1: any, formData2: any): boolean => {
  if (!formData1 || !formData2) return false;
  
  // Compare key properties that affect generation
  const keysToCompare = [
    'organizationName', 'articleTitle', 'targetAudience', 'technologyFocus',
    'articleObjective', 'toneOfArticle', 'exampleReferences', 'keywords', 'authorName'
  ];
  
  for (const key of keysToCompare) {
    const val1 = formData1[key];
    const val2 = formData2[key];
    
    // Handle arrays
    if (Array.isArray(val1) && Array.isArray(val2)) {
      if (val1.length !== val2.length) return false;
      for (let i = 0; i < val1.length; i++) {
        if (val1[i] !== val2[i]) return false;
      }
    } else if (val1 !== val2) {
      return false;
    }
  }
  
  return true;
};

// Global state interface
interface ArticleState {
  hasGeneratedOnce: boolean;
  hasGeneratedInThisSession: boolean;
  lastGeneratedPrompt: string;
  lastGeneratedFormData: any; // Track form data used for generation
  isComingFromValidation: boolean;
  generatedContent: string;
  currentPrompt: string;
}

// Context interface
interface ArticleContextType {
  state: ArticleState;
  updateState: (updates: Partial<ArticleState>) => void;
  resetSession: () => void;
  setPrompt: (prompt: string) => void;
  setGeneratedContent: (content: string) => void;
  markAsGenerated: (prompt: string, formData?: any) => void;
  setComingFromValidation: (value: boolean) => void;
  isFormDataSameAsGenerated: (currentFormData: any) => boolean;
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

// Initial state
const initialState: ArticleState = {
  hasGeneratedOnce: false,
  hasGeneratedInThisSession: false,
  lastGeneratedPrompt: '',
  lastGeneratedFormData: null,
  isComingFromValidation: false,
  generatedContent: '',
  currentPrompt: ''
};

export const ArticleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ArticleState>(initialState);

  const updateState = (updates: Partial<ArticleState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetSession = () => {
    setState(prev => ({ 
      ...prev, 
      hasGeneratedInThisSession: false,
      isComingFromValidation: false 
    }));
  };

  const setPrompt = (prompt: string) => {
    setState(prev => ({ ...prev, currentPrompt: prompt }));
  };

  const setGeneratedContent = (content: string) => {
    setState(prev => ({ ...prev, generatedContent: content }));
  };

  const markAsGenerated = (prompt: string, formData?: any) => {
    setState(prev => ({ 
      ...prev, 
      hasGeneratedOnce: true,
      hasGeneratedInThisSession: true,
      lastGeneratedPrompt: prompt,
      lastGeneratedFormData: formData,
      isComingFromValidation: false
    }));
  };

  const setComingFromValidation = (value: boolean) => {
    setState(prev => ({ 
      ...prev, 
      isComingFromValidation: value,
      ...(value && {
        hasGeneratedInThisSession: true,
        lastGeneratedPrompt: prev.currentPrompt
      })
    }));
  };

  const isFormDataSameAsGenerated = (currentFormData: any): boolean => {
    return areFormDataEqual(currentFormData, state.lastGeneratedFormData);
  };

  const value: ArticleContextType = {
    state,
    updateState,
    resetSession,
    setPrompt,
    setGeneratedContent,
    markAsGenerated,
    setComingFromValidation,
    isFormDataSameAsGenerated
  };

  return (
    <ArticleContext.Provider value={value}>
      {children}
    </ArticleContext.Provider>
  );
};

export const useArticleContext = () => {
  const context = useContext(ArticleContext);
  if (context === undefined) {
    throw new Error('useArticleContext must be used within an ArticleProvider');
  }
  return context;
};
