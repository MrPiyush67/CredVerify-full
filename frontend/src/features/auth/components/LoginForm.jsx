import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { useLogin } from '../authHooks.js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../auth.schema.js';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';

export function LoginForm({ className, ...props }) {
  const { mutateAsync: loginMutation, isPending } = useLogin();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await loginMutation(data);
      toast.success('Login successful');
    } catch (error) {
      const message = error?.message || 'Incorrect email or password';
      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your CredVerify account
                </p>
              </div>
              {serverError && (
                <FieldError className="m-auto">{serverError}</FieldError>
              )}
              <Field data-invalid={!!form.formState.errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  disabled={isPending}
                  {...form.register('email')}
                  aria-invalid={!!form.formState.errors.email}
                />
                <FieldError>{form.formState.errors.email?.message}</FieldError>
              </Field>
              <Field data-invalid={!!form.formState.errors.password}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    to="/forgot-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  disabled={isPending}
                  {...form.register('password')}
                  aria-invalid={!!form.formState.errors.password}
                />
                <FieldError>
                  {form.formState.errors.password?.message}
                </FieldError>
              </Field>
              <Field>
                <Button
                  type="submit"
                  className="rounded-md"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <LoaderCircle className="animate-spin size-4" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
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
                Don&apos;t have an account? <Link to="/signup">Sign up</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{' '}
        <Link onClick={() => toast('Coming soon')}>Terms of Service</Link> and{' '}
        <Link onClick={() => toast('Coming soon')}>Privacy Policy</Link>.
      </FieldDescription>
    </div>
  );
}
