/**
 * Custom hook for role-based theming
 * Provides consistent styling classes for role-specific UI elements
 */
export function useRoleTheme(role) {
  const roleBgClasses = {
    credentialist: 'bg-credentialist-primary hover:bg-credentialist-primary/90',
    curator: 'bg-curator-primary hover:bg-curator-primary/90',
    validant: 'bg-validant-primary hover:bg-validant-primary/90'
  };

  const roleTextClasses = {
    credentialist: 'text-credentialist-primary',
    curator: 'text-curator-primary',
    validant: 'text-validant-primary'
  };

  return {
    bgClass: roleBgClasses[role] || roleBgClasses.credentialist,
    textClass: roleTextClasses[role] || roleTextClasses.credentialist,
    roleBgClasses,
    roleTextClasses
  };
}
