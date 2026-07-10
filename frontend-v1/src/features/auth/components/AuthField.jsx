import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function AuthField({
  id,
  label,
  type = 'text',
  placeholder,
  field,
  error,
  required = false,
}) {
  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);
  const LeftIcon = isPassword ? Lock : Mail;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
        >
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}

      <div className="relative">
        <LeftIcon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        <input
          id={id}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          className={`h-12 w-full rounded-xl border bg-surface-elevated pl-11 pr-11 text-sm text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground ${
            error
              ? 'border-destructive focus:border-destructive'
              : 'border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/15'
          }`}
          {...field}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}
