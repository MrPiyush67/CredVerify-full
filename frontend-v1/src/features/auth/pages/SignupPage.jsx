// SignupPage.jsx

import { useState } from 'react';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Card } from '@/shared/ui';

import { signupSchema } from '../schemas/auth.schema';
import { useSignup } from '../hooks/authHooks';

import AuthLayout from '../components/AuthLayout';
import StepProgress from '../components/StepProgress';
import SignupStepOne from '../components/SignupStepOne';
import SignupStepTwo from '../components/SignupStepTwo';

export default function SignupPage() {
  const [step, setStep] = useState(1);

  const { mutateAsync: signupMutation, isPending } = useSignup();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      accountType: '',

      organizationName: '',
      organizationType: '',
      website: '',
      officialEmail: '',

      email: '',
      password: '',
      confirmPassword: '',

      terms: false,
    },
  });
  const accountType = watch('accountType');

  const onSubmit = async (data) => {
    try {
      await signupMutation(data);

      toast.success('Account created successfully!');
    } catch (error) {
      toast.error(error?.message || 'Failed to create account.');
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-4">
        <StepProgress step={step} />

        <Card className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[var(--shadow-card)] sm:p-6">
          {step === 1 ? (
            <SignupStepOne
              accountType={accountType}
              setAccountType={setValue}
              onContinue={() => setStep(2)}
            />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <SignupStepTwo
                accountType={accountType}
                register={register}
                errors={errors}
                isPending={isPending}
                onBack={() => setStep(1)}
              />
            </form>
          )}
        </Card>
      </div>
    </AuthLayout>
  );
}
