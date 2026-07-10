// SidebarSection.jsx

export default function SidebarSection({ title, children }) {
  return (
    <div className="mb-6">
      {title && (
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
      )}

      <ul className="space-y-1">{children}</ul>
    </div>
  );
}
