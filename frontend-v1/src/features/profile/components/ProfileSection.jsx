import { cn } from '@/shared/utils/cn';

export default function ProfileSection({
  title,
  icon: Icon,
  children,
  className,
}) {
  return (
    <section className={cn('space-y-5', className)}>
      <header className="flex items-center gap-2 border-b pb-3">
        {Icon && <Icon className="h-5 w-5 text-primary" />}

        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </header>

      {children}
    </section>
  );
}
