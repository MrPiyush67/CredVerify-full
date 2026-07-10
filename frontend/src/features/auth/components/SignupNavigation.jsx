import { ButtonGroup } from '@/components/ui/button-group.jsx';
import { Button } from '@/components/ui/button.jsx';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function SignupNavigation({ step, setStep }) {
  const handlePrevious = () => {
    if (step === 'organization') {
      setStep('learner');
    } else if (step === 'learner') {
      setStep('type');
    }
  };

  const handleNext = () => {
    if (step === 'type') {
      setStep('learner');
    } else if (step === 'learner') {
      setStep('organization');
    }
  };

  return (
    <div className="flex justify-center">
      <ButtonGroup>
        <ButtonGroup>
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={step === 'type'}
          >
            <ArrowLeft className="size-4" />
          </Button>
        </ButtonGroup>

        <ButtonGroup>
          <Button
            variant={step === 'type' ? 'default' : 'outline'}
            onClick={() => setStep('type')}
          >
            Select
          </Button>

          <Button
            variant={step === 'learner' ? 'default' : 'outline'}
            onClick={() => setStep('learner')}
          >
            Learner
          </Button>

          <Button
            variant={step === 'organization' ? 'default' : 'outline'}
            onClick={() => setStep('organization')}
          >
            Organization
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={step === 'organization'}
          >
            <ArrowRight className="size-4" />
          </Button>
        </ButtonGroup>
      </ButtonGroup>
    </div>
  );
}
