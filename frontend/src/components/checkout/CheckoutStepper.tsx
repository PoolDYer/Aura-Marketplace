import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

type CheckoutStepperProps = {
  currentStep: CheckoutStep;
  paymentRoute?: string;
};

const steps: Array<{ id: CheckoutStep; label: string; route?: string }> = [
  { id: 'shipping', label: 'Envio', route: '/checkout/shipping' },
  { id: 'payment', label: 'Pago' },
  { id: 'confirmation', label: 'Confirmacion' },
];

export function CheckoutStepper({ currentStep, paymentRoute }: CheckoutStepperProps) {
  const navigate = useNavigate();
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  const getRoute = (step: (typeof steps)[number]) => {
    if (step.id === 'payment') return paymentRoute;
    return step.route;
  };

  return (
    <nav className="mb-12 overflow-x-auto whitespace-nowrap" aria-label="Progreso del checkout">
      <ol className="flex min-w-max items-center justify-center gap-2 md:gap-8">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const route = getRoute(step);
          const canNavigateBack = isCompleted && Boolean(route);

          return (
            <li key={step.id} className="flex items-center gap-2 md:gap-8">
              <button
                type="button"
                onClick={() => {
                  if (canNavigateBack && route) navigate(route);
                }}
                disabled={!canNavigateBack}
                className={cn(
                  'group flex items-center gap-2 rounded-full px-1 py-1 text-left transition-colors',
                  canNavigateBack ? 'cursor-pointer hover:bg-[#f1edef]' : 'cursor-default',
                  !isCurrent && !isCompleted ? 'opacity-50' : '',
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 flex-none items-center justify-center rounded-full text-[12px] font-bold',
                    isCompleted
                      ? 'bg-[#006b5b] text-white'
                      : isCurrent
                        ? 'bg-[#ffb347] text-[#704700]'
                        : 'border-2 border-[#847463] text-[#524535]',
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span
                  className={cn(
                    'font-auth-display text-[18px] font-semibold md:text-[20px]',
                    isCurrent ? 'text-[#1c1b1d]' : 'text-[#524535]',
                    canNavigateBack ? 'group-hover:text-[#845400]' : '',
                  )}
                >
                  {step.label}
                </span>
              </button>

              {index < steps.length - 1 ? (
                <span
                  className={cn(
                    'h-px w-8 md:w-16',
                    index < currentIndex ? 'bg-[#006b5b]' : 'bg-[#d6c3b0]',
                  )}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
