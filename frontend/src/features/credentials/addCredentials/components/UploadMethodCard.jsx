import { Card, CardContent } from '@/components/ui/card';

export default function UploadMethodCard({ method }) {
  const Icon = method.icon;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={method.onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          method.onClick();
        }
      }}
      className="cursor-pointer gap-0 py-0 shadow-sm transition-all hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CardContent className="flex flex-col gap-3 p-6">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <div className="mb-1 text-lg font-semibold">{method.title}</div>
          <div className="text-sm text-muted-foreground">
            {method.description}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
