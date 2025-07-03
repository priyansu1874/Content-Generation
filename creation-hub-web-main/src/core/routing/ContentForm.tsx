import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BlogWorkflow from '@/modules/blog/BlogWorkflow';
import LinkedInAutomationForm from '@/modules/linkedin/LinkedInAutomationForm';
import TechnicalArticleWorkflow from '@/modules/technical-article/TechnicalArticleWorkflow';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ContentForm = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  const renderContentForm = () => {
    switch (type) {
      case 'website-blog':
        return <BlogWorkflow onBack={handleBack} />;
      
      case 'linkedin-post':
        return <LinkedInAutomationForm onBack={handleBack} />;
      
      case 'technical-article':
        return <TechnicalArticleWorkflow onBack={handleBack} />;
      
      default:
        return (
          <div className="max-w-4xl mx-auto p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Content Type Not Found
              </h1>
              <p className="text-gray-600 mb-8">
                The content type "{type}" is not yet implemented.
              </p>
              <Button onClick={handleBack} className="inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen py-8">
      {renderContentForm()}
    </div>
  );
};

export default ContentForm;
