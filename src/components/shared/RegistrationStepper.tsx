import { Check } from 'lucide-react';

interface Step {
  label: string;
  description?: string;
}

interface RegistrationStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function RegistrationStepper({ steps, currentStep, onStepClick }: RegistrationStepperProps) {
  return (
    <div className="w-full">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div key={step.label} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <button
                type="button"
                onClick={() => isCompleted && onStepClick?.(index)}
                disabled={!isCompleted}
                className={`flex items-center gap-3 ${isCompleted ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold shrink-0 transition-all duration-300 ${
                    isCompleted
                      ? 'border-status-verified bg-status-verified text-white'
                      : isActive
                        ? 'border-primary bg-primary text-white shadow-md shadow-primary/30'
                        : 'border-outline-variant bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {isCompleted ? <Check size={18} strokeWidth={3} /> : index + 1}
                </div>
                <div className="text-left">
                  <p
                    className={`text-sm font-semibold leading-tight ${
                      isActive ? 'text-primary' : isCompleted ? 'text-status-verified' : 'text-on-surface-variant'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-on-surface-variant mt-0.5 hidden lg:block">{step.description}</p>
                  )}
                </div>
              </button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div
                    className={`h-0.5 rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-status-verified' : 'bg-outline-variant'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="sm:hidden space-y-3">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div key={step.label} className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold shrink-0 ${
                  isCompleted
                    ? 'border-status-verified bg-status-verified text-white'
                    : isActive
                      ? 'border-primary bg-primary text-white'
                      : 'border-outline-variant bg-surface-container text-on-surface-variant'
                }`}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : index + 1}
              </div>
              <p
                className={`text-sm font-medium ${
                  isActive ? 'text-primary' : isCompleted ? 'text-status-verified' : 'text-on-surface-variant'
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
