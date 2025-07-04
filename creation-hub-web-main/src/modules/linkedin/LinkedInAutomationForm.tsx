import { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import StepIndicator from './StepIndicator';
import InputDetailsStep from './InputDetailsStep';
import PromptEditorStep from './PromptEditorStep';
import ContentPreviewStep from './ContentPreviewStep';
import { LinkedInFormProvider, useLinkedInFormContext } from './LinkedInFormContext';

export interface FormData {
  title: string;
  description: string;
  specialInstructions: string;
  tone: string;
  targetAudience: string;
  postAs: 'individual' | 'company';
  companyName: string;
  mediaOption: 'upload' | 'url' | 'none';
  mediaFile?: File;
  mediaUrl: string;
  includeCTA: 'yes' | 'no';
  includeAnalytics: 'yes' | 'no';
  includeHashtags: 'yes' | 'no';
  persona: string;
  postLength: string;
  postType: string;
  finalPrompt: string;
  generatedContent: string;
  approvalResponse?: string;
}

interface LinkedInAutomationFormProps {
  onBack?: () => void;
  onPost?: () => void;
  initialFormData?: FormData | null;
}

const LinkedInAutomationFormInner = ({ onBack, onPost, initialFormData }: LinkedInAutomationFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { formData, setFormData } = useLinkedInFormContext();

  // Initialize form data if provided
  useState(() => {
    if (initialFormData) {
      setFormData(initialFormData);
    }
  });

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateContent = () => {
    // Simulate AI content generation
    const mockContent = `🚀 ${formData.title}

${formData.description}

Key insights:
• Innovation drives success
• Collaboration builds stronger teams  
• Continuous learning is essential

What's your experience with this? Share your thoughts below! 👇

#LinkedIn #Professional #Growth ${formData.tone === 'Technical' ? '#Tech #Innovation' : '#Business #Success'}`;
    
    updateFormData({ generatedContent: mockContent });
    nextStep();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8 shadow-xl bg-white">
        <StepIndicator currentStep={currentStep} />
        
        <div className="mt-8">
          {currentStep === 1 && (
            <InputDetailsStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onBack={onBack}
            />
          )}          
          {currentStep === 2 && (
            <PromptEditorStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          
          {currentStep === 3 && (
            <ContentPreviewStep
              formData={formData}
              onPrev={prevStep}
              onPost={onPost}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

const LinkedInAutomationForm = (props: LinkedInAutomationFormProps) => {
  return (
    <LinkedInFormProvider>
      <LinkedInAutomationFormInner {...props} />
    </LinkedInFormProvider>
  );
};

export default LinkedInAutomationForm;
