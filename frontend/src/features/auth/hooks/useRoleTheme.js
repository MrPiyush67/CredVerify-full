/**
 * Custom hook for role-based theming
 * Provides consistent styling classes for role-specific UI elements
 */
export function useRoleTheme(role) {
  const roleBgClasses = {
    learner: 'bg-learner-primary hover:bg-learner-primary/90',
    employer: 'bg-employer-primary hover:bg-employer-primary/90',
    regulator: 'bg-regulator-primary hover:bg-regulator-primary/90'
  };

  const roleTextClasses = {
    learner: 'text-learner-primary',
    employer: 'text-employer-primary',
    regulator: 'text-regulator-primary'
  };

  return {
    bgClass: roleBgClasses[role] || roleBgClasses.learner,
    textClass: roleTextClasses[role] || roleTextClasses.learner,
    roleBgClasses,
    roleTextClasses
  };
}
