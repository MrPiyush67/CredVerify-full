import React, { useState } from 'react';
import { Link } from 'react-router';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button, Card } from '@/shared/ui';

import { loginSchema } from '../schemas/auth.schema';
import { useLogin } from '../hooks/authHooks';

import AuthLayout from '../components/AuthLayout';
import AuthHeader from '../components/AuthHeader';
import AuthField from '../components/AuthField';

export default function LoginPage() {
  const { mutateAsync: loginMutation, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
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
      toast.success('Login successful!');
    } catch (error) {
      const message = error?.message || 'Incorrect email or password.';
      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <AuthLayout>
      <Card className="rounded-3xl border border-border/80 bg-card/95 p-8 shadow-[var(--shadow-card)]">
        <AuthHeader
          title="Welcome back"
          description="Sign in to access your verified credential portfolio."
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {serverError && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{serverError}</p>
            </div>
          )}

          <AuthField
            id="email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            field={register('email')}
            error={errors.email}
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Password
              </label>

              <Link
                to="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <AuthField
              id="password"
              type="password"
              placeholder="Enter your password"
              field={register('password')}
              error={errors.password}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="h-12 w-full rounded-lg"
          >
            {isPending ? (
              'Signing in...'
            ) : (
              <div className="flex items-center gap-2">
                Login
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </div>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline" />
            </div>

            <div className="relative flex justify-center">
              <span className="bg-card px-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                OR
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-lg"
          >
            Continue with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-primary hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </Card>
    </AuthLayout>
  );
}
