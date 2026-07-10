import { useState } from 'react';
import { GraduationCap, Building2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';

export function SignupType({ setStep }) {
  const [selected, setSelected] = useState('learner');

  return (
    <>
      <div className="mb-8 rounded-lg border bg-muted/40 p-4">
        <p className="text-sm font-medium">Why CredVerify?</p>

        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>✓ Secure digital credentials</li>
          <li>✓ One-click verification</li>
          <li>✓ Share credentials anywhere</li>
        </ul>
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Choose the type of account you want to create.
        </p>
      </div>

      <div className="p-6 md:p-8">
        <FieldGroup>
          <Field>
            <button
              type="button"
              onClick={() => setSelected('learner')}
              className={`flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors ${
                selected === 'learner'
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
            >
              <GraduationCap className="mt-1 size-5 text-primary" />

              <div className="flex-1">
                <FieldLabel>Learner</FieldLabel>

                <FieldDescription>
                  Receive, manage and share your verified credentials.
                </FieldDescription>
              </div>
            </button>
          </Field>

          <Field>
            <button
              type="button"
              onClick={() => setSelected('organization')}
              className={`flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors ${
                selected === 'organization'
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
            >
              <Building2 className="mt-1 size-5 text-primary" />

              <div className="flex-1">
                <FieldLabel>Organization</FieldLabel>

                <FieldDescription>
                  Issue, manage and verify credentials for learners.
                </FieldDescription>
              </div>
            </button>
          </Field>

          <Field>
            <Button type="button" onClick={() => setStep(selected)}>
              Continue
            </Button>
          </Field>
        </FieldGroup>
      </div>
    </>
  );
}
