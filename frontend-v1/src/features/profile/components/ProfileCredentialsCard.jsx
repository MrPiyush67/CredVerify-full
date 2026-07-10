import { ShieldCheck } from 'lucide-react';
import { Badge, Card, CardContent } from '@/shared/ui';

export default function ProfileCredentialsCard({ credentials = 0 }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Credentials
        </h3>

        <div>
          <div className="text-4xl font-bold">{credentials}</div>

          <p className="text-sm text-muted-foreground">Verified Credentials</p>
        </div>

        <Badge>
          <ShieldCheck className="mr-2 h-3 w-3" />
          Verified Profile
        </Badge>
      </CardContent>
    </Card>
  );
}
