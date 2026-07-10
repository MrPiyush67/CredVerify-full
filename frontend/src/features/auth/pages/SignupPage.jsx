import { useState } from 'react';
import { LearnerSignupForm } from '../components/LearnerSignupForm.jsx';
import { SignupType } from '../components/SignupType.jsx';
import { OrganizationSignupForm } from '../components/OrganizationSignupForm.jsx';
import { SignupNavigation } from '../components/SignupNavigation.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { FieldDescription } from '@/components/ui/field.jsx';
import { Link } from 'react-router';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [step, setStep] = useState('type');
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-5xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-5">
              {/* Image */}
              <div className="relative hidden bg-muted md:block col-span-2">
                <img
                  src="/placeholder.svg"
                  alt="Image"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />  
              </div>

              {/* Right Side */}
              <div className="p-6 md:p-8 col-span-3">
                <SignupNavigation step={step} setStep={setStep} />

                <div className="mt-8 min-h-[590px]">
                  {step === 'type' && <SignupType setStep={setStep} />}

                  {step === 'learner' && <LearnerSignupForm />}

                  {step === 'organization' && <OrganizationSignupForm />}
                </div>
              </div>
            </CardContent>
          </Card>
          <FieldDescription className="px-6 text-center">
            By continuing, you agree to our{' '}
            <Link onClick={() => toast('Coming soon')}>Terms of Service</Link>{' '}
            and <Link onClick={() => toast('Coming soon')}>Privacy Policy</Link>
            .
          </FieldDescription>
        </div>
      </div>
    </div>
  );
}
