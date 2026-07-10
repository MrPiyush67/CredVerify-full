// SignupStepTwo.jsx

import { Link } from 'react-router';
import { Button } from '@/shared/ui';

import LearnerFields from './LearnerFields';
import OrganizationFields from './OrganizationFields';
import AuthField from './AuthField';

export default function SignupStepTwo({
  accountType,
  register,
  errors,
  isPending,
  onBack,
}) {
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-primary hover:underline"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to Selection
      </button>

      <div className="text-center md:text-left">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {accountType === 'learner'
            ? 'Learner Registration'
            : 'Organization Onboarding'}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Fill in your details to create your secure identity.
        </p>
      </div>

      <div className="space-y-4">
        {accountType === 'learner' ? (
          <LearnerFields register={register} errors={errors} />
        ) : (
          <OrganizationFields register={register} errors={errors} />
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <AuthField
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            field={register('password')}
            error={errors.password}
          />

          <AuthField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            field={register('confirmPassword')}
            error={errors.confirmPassword}
          />
        </div>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            {...register('terms')}
            className="mt-1 h-5 w-5 rounded border-outline text-primary"
          />

          <span className="text-sm text-on-surface-variant">
            I agree to the{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {errors.terms && (
          <p className="text-xs text-destructive">{errors.terms.message}</p>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="h-11 w-full rounded-xl"
        >
          {isPending ? 'Creating Account...' : 'Create Account'}
        </Button>

        <p className="text-center text-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
