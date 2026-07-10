import { Button } from '@/components/ui/button.jsx';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Link } from 'react-router';
import { LoaderCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { signupSchema } from '../auth.schema.js';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSignup } from '../authHooks.js';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.jsx';

export function OrganizationSignupForm() {
  const { mutateAsync: signupMutation, isPending } = useSignup();

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      accountType: 'organization',
      organizationName: '',
      website: '',
      organizationType: '',
      officialEmail: '',
    },
  });

  const [serverError, setServerError] = useState('');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await signupMutation(data);
      toast.success('Organization account created successfully');
    } catch (error) {
      const message = error?.message || 'Failed to create organization account';
      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Register your organization</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Create an organization account to issue and manage verified
          credentials.
        </p>
      </div>
      <form
        className="p-6 pb-0 md:p-8 md:pb-0"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup>
          {serverError && (
            <FieldError className="m-auto">{serverError}</FieldError>
          )}

          <Field data-invalid={!!form.formState.errors.organizationName}>
            <FieldLabel htmlFor="organizationName">
              Organization Name
            </FieldLabel>

            <Input
              id="organizationName"
              placeholder="University of Innovation"
              {...form.register('organizationName')}
              disabled={isPending}
              aria-invalid={!!form.formState.errors.organizationName}
            />

            <FieldError>
              {form.formState.errors.organizationName?.message}
            </FieldError>
          </Field>

          <Field className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!form.formState.errors.website}>
              <FieldLabel htmlFor="website">Official Website</FieldLabel>

              <Input
                id="website"
                type="url"
                placeholder="https://example.edu"
                {...form.register('website')}
                disabled={isPending}
                aria-invalid={!!form.formState.errors.website}
              />

              <FieldError>{form.formState.errors.website?.message}</FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.officialEmail}>
              <FieldLabel htmlFor="organizationType">
                Organization Type
              </FieldLabel>

              <Select
                value={form.watch('organizationType')}
                onValueChange={(value) =>
                  form.setValue('organizationType', value, {
                    shouldValidate: true,
                  })
                }
                disabled={isPending}
              >
                <SelectTrigger
                  id="organizationType"
                  className="w-full"
                  aria-invalid={!!form.formState.errors.organizationType}
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="higher-education">
                    Higher Education
                  </SelectItem>

                  <SelectItem value="corporate-training">
                    Corporate Training
                  </SelectItem>

                  <SelectItem value="government">Government</SelectItem>

                  <SelectItem value="non-profit">Non-Profit</SelectItem>
                </SelectContent>
              </Select>

              <FieldError>
                {form.formState.errors.organizationType?.message}
              </FieldError>
            </Field>
          </Field>

          <Field data-invalid={!!form.formState.errors.officialEmail}>
            <FieldLabel htmlFor="officialEmail">
              Official Email Address
            </FieldLabel>

            <Input
              id="officialEmail"
              type="email"
              placeholder="contact@example.edu"
              {...form.register('officialEmail')}
              disabled={isPending}
              aria-invalid={!!form.formState.errors.officialEmail}
            />

            <FieldError>
              {form.formState.errors.officialEmail?.message}
            </FieldError>
          </Field>

          <Field>
            <div className="rounded-md border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">
                Organization accounts require manual verification before issuing
                credentials. Approval typically takes{' '}
                <strong>24–48 hours</strong>.
              </p>
            </div>
          </Field>

          <Field>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Creating organization...
                </>
              ) : (
                'Create Organization'
              )}
            </Button>
          </Field>

          <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
            Or continue with
          </FieldSeparator>

          <Field>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => toast('Coming soon')}
            >
              <img
                src="/google-color-svgrepo-com.svg"
                alt="Google"
                width="20"
                height="20"
              />
              Sign in with Google
            </Button>
          </Field>

          <FieldDescription className="text-center">
            Already have an account? <Link to="/login">Sign in</Link>
          </FieldDescription>
        </FieldGroup>
      </form>
    </>
  );
}
