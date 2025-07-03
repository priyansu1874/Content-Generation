
import React, { useState, useEffect } from 'react';
import StepIndicator from './StepIndicator';
import InputDetailsForm from './InputDetailsForm';
import PromptPreview from './PromptPreview';
import ArticleOutput from './ArticleOutput';
import { FormData } from './types/article';
import { useArticleContext, ArticleProvider } from './contexts/ArticleContext';

interface TechnicalArticleWorkflowProps {
  onBack: () => void;
}

const TechnicalArticleWorkflowContent: React.FC<TechnicalArticleWorkflowProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    organizationName: '',
    articleTitle: '',
    targetAudience: [],
    technologyFocus: '',
    articleObjective: '',
    toneOfArticle: '',
    exampleReferences: '',
    keywords: [],
    uploadedImages: [],
    authorName: ''
  });
  const [editablePrompt, setEditablePrompt] = useState('');
  const [generatedArticle, setGeneratedArticle] = useState('');

  const { state, setComingFromValidation, resetSession, setGeneratedContent } = useArticleContext();

  const steps = [
    { number: 1, title: 'Input Details', description: 'Provide article requirements' },
    { number: 2, title: 'AI Prompt', description: 'Review and edit prompt' },
    { number: 3, title: 'Article Output', description: 'Review and approve' }
  ];

  // Handle navigation to different steps
  const nextStep = () => {
    if (currentStep < 3) {
      // Reset session state when going from Page 1 to Page 2
      if (currentStep === 1) {
        resetSession();
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
    nextStep();
  };

  const handlePromptGeneration = (prompt: string) => {
    setEditablePrompt(prompt);
  };

  const handleArticleGeneration = (article: string) => {
    setGeneratedArticle(article);
    setGeneratedContent(article);
    nextStep();
  };

  const goToPromptEdit = () => {
    // Mark as coming from validation page and ensure generated content is in context
    setComingFromValidation(true);
    if (generatedArticle) {
      setGeneratedContent(generatedArticle);
    }
    setCurrentStep(2);
  };

  // Sync generated article with context
  useEffect(() => {
    if (state.generatedContent && state.generatedContent !== generatedArticle) {
      setGeneratedArticle(state.generatedContent);
    }
  }, [state.generatedContent, generatedArticle]);

  return (
    <div className="max-w-6xl mx-auto">
      <StepIndicator steps={steps} currentStep={currentStep} />
      
      <div className="mt-8">
        {currentStep === 1 && (
          <InputDetailsForm 
            onSubmit={handleFormSubmit}
            initialData={formData}
          />
        )}
        
        {currentStep === 2 && (
          <PromptPreview
            formData={formData}
            onPromptGenerated={handlePromptGeneration}
            onArticleGenerated={handleArticleGeneration}
            onBack={prevStep}
            existingGeneratedArticle={generatedArticle}
          />
        )}
        
        {currentStep === 3 && (
          <ArticleOutput
            article={generatedArticle}
            formData={formData}
            onEditPrompt={goToPromptEdit}
            onBack={prevStep}
          />
        )}
      </div>
    </div>
  );
};

const TechnicalArticleWorkflow: React.FC<TechnicalArticleWorkflowProps> = ({ onBack }) => {
  return (
    <ArticleProvider>
      <TechnicalArticleWorkflowContent onBack={onBack} />
    </ArticleProvider>
  );
};

export default TechnicalArticleWorkflow;
