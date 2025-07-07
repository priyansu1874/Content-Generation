import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogFormGenerator, { BlogFormGeneratorProps } from '@/modules/blog/BlogFormGenerator';
import FinalPrompt from '@/modules/blog/FinalPrompt';
import ContentValidation from '@/modules/blog/ContentValidation';
import { BlogFormProvider, useBlogForm } from '@/modules/blog/BlogFormContext';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BlogWorkflowProps {
  onBack?: () => void;
}

type BlogFormGeneratorNextData = Parameters<BlogFormGeneratorProps['onNext']>[0];

const BlogWorkflowInner = ({ onBack }: BlogWorkflowProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'form' | 'prompt' | 'validation'>('form');
  const [blogFormData, setBlogFormData] = useState<BlogFormGeneratorNextData | null>(null);
  const [finalContent, setFinalContent] = useState<string>('');
  const { setComingFromValidation } = useBlogForm();

  const handleFormNext = (data: BlogFormGeneratorNextData) => {
    setBlogFormData(data);
    // Clear the coming from validation flag when navigating from form to prompt
    if (setComingFromValidation) {
      setComingFromValidation(false);
    }
    setCurrentStep('prompt');
  };

  const handlePromptSubmitForApproval = (content: string) => {
    setFinalContent(content);
    setCurrentStep('validation');
  };

  const handleValidationPost = () => {
    // Handle the post action
    console.log('Posting content:', finalContent);
    // Return to dashboard after successful completion
    navigate('/dashboard');
  };

  const handlePromptBack = () => {
    // Clear the coming from validation flag when navigating from prompt to form
    if (setComingFromValidation) {
      setComingFromValidation(false);
    }
    setCurrentStep('form');
  };

  const handleValidationBack = () => {
    // Simply navigate back to the prompt page
    // The setComingFromValidation flag will be set by ContentValidation component
    setCurrentStep('prompt');
  };

  const handleValidationComplete = () => {
    // Return to dashboard after successful completion
    navigate('/dashboard');
  };

  const handleBackToDashboard = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard');
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'form':
        return (
          <BlogFormGenerator 
            onNext={handleFormNext} 
            initialFormData={blogFormData}
            onBack={handleBackToDashboard}
          />
        );
      
      case 'prompt':
        return (
          <FinalPrompt
            formData={blogFormData!}
            systemPrompt={blogFormData?.webhookResponse || ''}
            onSubmitForApproval={handlePromptSubmitForApproval}
            onBack={handlePromptBack}
            onNext={() => setCurrentStep('validation')}
          />
        );
      
      case 'validation':
        return (
          <ContentValidation
            prompt={finalContent}
            onBack={handleValidationBack}
            onPost={handleValidationPost}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {renderCurrentStep()}
    </div>
  );
};

const BlogWorkflow = ({ onBack }: BlogWorkflowProps) => {
  return (
    <BlogFormProvider>
      <BlogWorkflowInner onBack={onBack} />
    </BlogFormProvider>
  );
};

export default BlogWorkflow;
