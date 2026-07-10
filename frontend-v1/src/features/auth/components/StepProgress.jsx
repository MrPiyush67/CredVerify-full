import { Check } from 'lucide-react';

export default function StepProgress({ step }) {
  const isStep1Complete = step > 1;
  const isStep2Active = step === 2;

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${isStep1Complete || step === 1 ? 'bg-primary text-primary-foreground' : 'bg-surface-muted text-muted-foreground'}`}
        >
          {isStep1Complete ? <Check size={16} /> : '1'}
        </div>
        <span
          className={`text-xs font-semibold uppercase tracking-[0.2em] ${step === 1 ? 'text-primary' : 'text-muted-foreground'}`}
        >
          Identity
        </span>
      </div>

      <div className="mx-4 h-[2px] flex-1 overflow-hidden rounded-full bg-border/80">
        <div
          className={`h-full bg-primary transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`}
        />
      </div>

      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${isStep2Active ? 'bg-primary text-primary-foreground' : 'bg-surface-muted text-muted-foreground'}`}
        >
          2
        </div>
        <span
          className={`text-xs font-semibold uppercase tracking-[0.2em] ${isStep2Active ? 'text-primary' : 'text-muted-foreground'}`}
        >
          Profile
        </span>
      </div>
    </div>
  );
}
