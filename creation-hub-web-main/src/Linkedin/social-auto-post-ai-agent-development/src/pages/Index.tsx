
import LinkedInAutomationForm from '@/components/LinkedInAutomationForm';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            LinkedIn Content Automation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create engaging LinkedIn content with AI assistance. Generate professional posts in minutes with our step-by-step wizard.
          </p>
        </div>
        <LinkedInAutomationForm />
      </div>
    </div>
  );
};

export default Index;
