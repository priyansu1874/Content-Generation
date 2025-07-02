
import { CheckCircle } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  const steps = [
    { number: 1, title: 'Input Details', description: 'Enter post information' },
    { number: 2, title: 'Edit Prompt', description: 'Review and customize' },
    { number: 3, title: 'Final Preview', description: 'Review and post' }
  ];

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
              step.number < currentStep 
                ? 'bg-green-500 border-green-500 text-white' 
                : step.number === currentStep
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-gray-100 border-gray-300 text-gray-500'
            }`}>
              {step.number < currentStep ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="text-sm font-semibold">{step.number}</span>
              )}
            </div>
            <div className="text-center mt-2">
              <div className={`text-sm font-medium ${
                step.number <= currentStep ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.title}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {step.description}
              </div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-4 ${
              step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
