import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogFormGenerator, { BlogFormGeneratorProps } from '@/Blog/BlogFormGenerator';
import FinalPrompt from '@/Blog/FinalPrompt';
import ContentValidation from '@/Blog/ContentValidation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BlogWorkflowProps {
  onBack?: () => void;
}

type BlogFormGeneratorNextData = Parameters<BlogFormGeneratorProps['onNext']>[0];

const BlogWorkflow = ({ onBack }: BlogWorkflowProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'form' | 'prompt' | 'validation'>('form');
  const [blogFormData, setBlogFormData] = useState<BlogFormGeneratorNextData | null>(null);
  const [finalContent, setFinalContent] = useState<string>('');

  const handleFormNext = (data: BlogFormGeneratorNextData) => {
    setBlogFormData(data);
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
    setCurrentStep('form');
  };

  const handleValidationBack = () => {
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

export default BlogWorkflow;
