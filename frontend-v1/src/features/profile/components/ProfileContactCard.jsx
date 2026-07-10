import { Mail, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui';

export default function ProfileContactCard({ profile }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Contact
        </h3>

        {profile.email && (
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-primary" />
            {profile.email}
          </div>
        )}

        {profile.location && (
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            {profile.location}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
