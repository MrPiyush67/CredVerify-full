import { Camera, Mail, MapPin, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Maps your `role` enum to a friendly label shown next to the name.
const ROLE_LABELS = {
  learner: 'Learner',
  issuer: 'Issuer',
  regulator: 'Regulator',
  organization_admin: 'Org Admin',
};

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function SettingsHeader({ user, onAvatarChange }) {
  const handleAvatarClick = (e) => {
    const file = e.target.files?.[0];
    if (file) onAvatarChange?.(file);
  };

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="text-xl font-medium text-muted-foreground">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <label
            htmlFor="avatar-upload"
            className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent"
          >
            <Camera className="h-3.5 w-3.5" />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarClick}
            />
          </label>
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold leading-none">{user?.name}</h1>
            <Badge variant="secondary" className="rounded-full font-normal">
              {ROLE_LABELS[user?.role] ?? user?.role}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            {user?.skills?.[0] ? user.skills[0] : `@${user?.username}`}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-sm text-muted-foreground">
            {
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {user?.email || 'N/A'}
              </span>
            }
            {
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {user?.location.slice(0, 20) || 'N/A'}
              </span>
            }
            {
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Joined :{' '}
                {user?.createdAt
                  ? new Date(user.createdAt).toDateString()
                  : 'N/A'}
              </span>
            }
          </div>
        </div>
      </div>
    </Card>
  );
}
