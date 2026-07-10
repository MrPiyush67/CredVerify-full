export default function AuthHeader({ title, description, children }) {
  return (
    <div className="mb-8 text-center">
      {children && <div className="mb-6 flex justify-center">{children}</div>}

      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>

      {description && (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
