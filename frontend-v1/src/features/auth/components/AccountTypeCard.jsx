export default function AccountTypeCard({
  title,
  description,
  icon,
  selected,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col rounded-2xl border p-6 text-left transition-all duration-200 ${
        selected
          ? 'border-primary bg-primary/8 shadow-[0_16px_40px_-24px_rgba(15,35,32,0.35)]'
          : 'border-border/80 bg-surface-elevated hover:border-primary/40 hover:bg-surface-muted'
      }`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
        <span className="material-symbols-outlined">{icon}</span>
      </div>

      <h3 className="mb-1 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </button>
  );
}
