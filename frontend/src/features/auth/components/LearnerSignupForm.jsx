import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useSignup } from '../authHooks.js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '../auth.schema.js';
import toast from 'react-hot-toast';

export function LearnerSignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutateAsync: signupMutation, isPending } = useSignup();

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      accountType: 'learner',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',

      terms: true,
    },
  });
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await signupMutation(data);
      toast.success('Account created successfully');
    } catch (error) {
      const message = error?.message || 'Failed to create account';
      setServerError(message);
      toast.error(message);
    }
  };
  return (
    <>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Enter your email below to create your account
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
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="name">Full Name</FieldLabel>
            <FieldDescription>
              This name will be used to verify your credentials so fill legit
              name
            </FieldDescription>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...form.register('name')}
              disabled={isPending}
              aria-invalid={!!form.formState.errors.name}
            />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>
          <Field data-invalid={!!form.formState.errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...form.register('email')}
              disabled={isPending}
              aria-invalid={!!form.formState.errors.email}
            />
            <FieldError>{form.formState.errors.email?.message}</FieldError>
          </Field>
          <Field>
            <Field className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!form.formState.errors.password}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pr-10"
                    {...form.register('password')}
                    disabled={isPending}
                    aria-invalid={!!form.formState.errors.password}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
                <FieldError>
                  {form.formState.errors.password?.message}
                </FieldError>
              </Field>
              <Field data-invalid={!!form.formState.errors.confirmPassword}>
                <FieldLabel htmlFor="confirm-password">
                  Confirm Password
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pr-10"
                    {...form.register('confirmPassword')}
                    disabled={isPending}
                    aria-invalid={!!form.formState.errors.confirmPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    disabled={isPending}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
                <FieldError>
                  {form.formState.errors.confirmPassword?.message}
                </FieldError>
              </Field>
            </Field>
            <FieldDescription>
              Must be at least 8 characters long.
            </FieldDescription>
          </Field>
          <Field>
            <Button type="submit" className="rounded-md" disabled={isPending}>
              {isPending ? (
                <>
                  <LoaderCircle className="animate-spin size-4" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </Field>
          <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
            Or continue with
          </FieldSeparator>
          <Field>
            <Button
              variant="outline"
              type="button"
              className="rounded-md"
              disabled={isPending}
              onClick={() => toast('Coming soon')}
            >
              <img
                src="/google-color-svgrepo-com.svg"
                alt="Google Logo"
                width="20"
                height="20"
              />
              Sign in with Google
              <span className="sr-only">Login with Google</span>
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
