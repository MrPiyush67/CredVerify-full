// OrganizationFields.jsx

import AuthField from './AuthField';

export default function OrganizationFields({ register, errors }) {
  return (
    <>
      <AuthField
        id="organizationName"
        label="Organization Name"
        placeholder="University of Innovation"
        field={register('organizationName')}
        error={errors.organizationName}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AuthField
          id="website"
          label="Official Website"
          type="url"
          placeholder="https://example.edu"
          field={register('website')}
          error={errors.website}
        />

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Organization Type
          </label>

          <select
            {...register('organizationType')}
            className={`h-12 w-full rounded-lg border bg-surface-container-lowest px-4 text-sm outline-none transition-all ${
              errors.organizationType
                ? 'border-destructive focus:border-destructive'
                : 'border-outline focus:border-primary'
            }`}
          >
            <option value="">Select Type</option>
            <option value="higher-education">Higher Education</option>
            <option value="corporate-training">Corporate Training</option>
            <option value="government">Government</option>
            <option value="non-profit">Non-Profit</option>
          </select>

          {errors.organizationType && (
            <p className="text-xs text-destructive">
              {errors.organizationType.message}
            </p>
          )}
        </div>
      </div>

      <AuthField
        id="officialEmail"
        label="Official Email Address"
        type="email"
        placeholder="contact@example.edu"
        field={register('officialEmail')}
        error={errors.officialEmail}
      />

      <div className="flex gap-3 rounded-lg border border-outline bg-surface-variant p-4">
        <span className="material-symbols-outlined text-primary">info</span>

        <p className="text-sm leading-6 text-on-surface-variant">
          Organization accounts require verification before they can issue
          credentials. Approval typically takes 24–48 hours.
        </p>
      </div>
    </>
  );
}
