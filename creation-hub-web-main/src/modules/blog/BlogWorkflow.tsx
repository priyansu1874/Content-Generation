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
  const [blogFormData, setBlogFormData] = useState<BlogFormGeneratorNextData | null>(null);
  const [finalContent, setFinalContent] = useState<string>('');
  const { currentStep, navigateToStep } = useBlogForm();

  const handleFormNext = (data: BlogFormGeneratorNextData) => {
    setBlogFormData(data);
    navigateToStep('prompt');
  };

  const handlePromptSubmitForApproval = (content: string) => {
    setFinalContent(content);
    navigateToStep('validation');
  };

  const handleValidationPost = () => {
    console.log('Posting content:', finalContent);
    navigate('/dashboard');
  };

  const handlePromptBack = () => {
    navigateToStep('form');
  };

  const handleValidationBack = () => {
    navigateToStep('prompt');
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
            onNext={() => navigateToStep('validation')}
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
