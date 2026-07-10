// LearnerFields.jsx

import AuthField from './AuthField';

export default function LearnerFields({ register, errors }) {
  return (
    <>
      <AuthField
        id="name"
        label="Full Name"
        placeholder="John Doe"
        field={register('name')}
        error={errors.name}
      />

      <AuthField
        id="email"
        label="Email Address"
        type="email"
        placeholder="john@example.com"
        field={register('email')}
        error={errors.email}
      />
    </>
  );
}
