
import React from 'react';
import { Check } from 'lucide-react';
import { Step } from '../types/article';

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                step.number < currentStep
                  ? 'bg-green-500 border-green-500 text-white'
                  : step.number === currentStep
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-white border-slate-300 text-slate-400'
              }`}
            >
              {step.number < currentStep ? (
                <Check className="w-6 h-6" />
              ) : (
                <span className="font-semibold">{step.number}</span>
              )}
            </div>
            <div className="mt-2 text-center">
              <div className={`font-medium ${
                step.number <= currentStep ? 'text-slate-800' : 'text-slate-400'
              }`}>
                {step.title}
              </div>
              <div className="text-sm text-slate-500">{step.description}</div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-24 h-0.5 mx-4 mt-[-60px] transition-all duration-300 ${
                step.number < currentStep ? 'bg-green-500' : 'bg-slate-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
