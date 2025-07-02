import { useState } from 'react';
import { Card } from '@/components/ui/card';
import StepIndicator from './form/StepIndicator';
import InputDetailsStep from './form/InputDetailsStep';
import PromptEditorStep from './form/PromptEditorStep';
import ContentPreviewStep from './form/ContentPreviewStep';

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

const LinkedInAutomationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
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

  const generatePrompt = () => {
    const prompt = `Create a LinkedIn post with the following details:

Title: ${formData.title}
Description: ${formData.description}
Tone: ${formData.tone}
Target Audience: ${formData.targetAudience}
Posting as: ${formData.postAs === 'company' ? formData.companyName : 'Individual'}
Persona: ${formData.persona}
Post Length: ${formData.postLength}
Post Type: ${formData.postType}
Include Call to Action: ${formData.includeCTA}
Include Analytics: ${formData.includeAnalytics}
Include Hashtags: ${formData.includeHashtags}

Special Instructions: ${formData.specialInstructions}

Please create engaging content that resonates with the target audience and matches the specified tone.`;
    
    updateFormData({ finalPrompt: prompt });
    nextStep();
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
            />
          )}          
          {currentStep === 2 && (
            <PromptEditorStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={generateContent}
              onPrev={prevStep}
            />
          )}
          
          {currentStep === 3 && (
            <ContentPreviewStep
              formData={formData}
              onPrev={prevStep}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default LinkedInAutomationForm;
