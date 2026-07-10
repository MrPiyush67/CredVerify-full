// SignupStepOne.jsx

import { Button } from '@/shared/ui';
import AccountTypeCard from './AccountTypeCard';

export default function SignupStepOne({
  accountType,
  setAccountType,
  onContinue,
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center md:text-left">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          How will you use CredVerify?
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Choose the account type that best fits your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <AccountTypeCard
          title="Learner"
          description="Securely store and share your digital credentials with the world."
          icon="school"
          selected={accountType === 'learner'}
          onClick={() => setAccountType('accountType', 'learner')}
        />

        <AccountTypeCard
          title="Organization"
          description="Issue tamper-proof, verifiable digital certificates and badges."
          icon="corporate_fare"
          selected={accountType === 'organization'}
          onClick={() => setAccountType('accountType', 'organization')}
        />
      </div>

      <Button
        type="button"
        onClick={onContinue}
        disabled={!accountType}
        className="h-11 w-full rounded-xl"
      >
        <span>Continue to Registration</span>

        <span className="material-symbols-outlined ml-2 text-[20px]">
          arrow_forward
        </span>
      </Button>
    </div>
  );
}
