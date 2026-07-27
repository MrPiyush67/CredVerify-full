import { MapPin, Calendar, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FaLinkedin, FaGithub, FaSuitcase } from 'react-icons/fa';
import { Badge } from '@/components/ui/badge.jsx';

const LINK_ICONS = {
  github: FaGithub,
  linkedin: FaLinkedin,
  portfolio: FaSuitcase,
  website: Globe,
};

function formatJoinedDate(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function ProfileSidebar({ user }) {
  const joined = formatJoinedDate(user?.createdAt);
  const links = Object.entries(user?.socialLinks ?? {}).filter(
    ([, url]) => url,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start space-y-2">
        <Avatar className="h-24 w-24 mt-2">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback className="text-2xl font-medium text-muted-foreground">
            {user?.name
              ?.split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>

        <h1 className="text-lg font-semibold tracking-tight text-foreground flex gap-4 items-center justify-center">
          {user?.name}
          <Badge className="mt-0.5">{user?.role}</Badge>
        </h1>
        <p className="text-sm text-muted-foreground mb-2">@{user?.username}</p>
        {user?.bio && (
          <p className="text-sm text-muted-foreground">{user.bio}</p>
        )}
      </div>

      <div className="space-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
        {user?.location && (
          <p className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {user.location}
          </p>
        )}
        {joined && (
          <p className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            Joined {joined}
          </p>
        )}
      </div>

      {links.length > 0 && (
        <div className="flex gap-2 border-t border-border pt-4">
          {links.map(([key, url]) => {
            const Icon = LINK_ICONS[key] ?? Globe;
            return (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                aria-label={key}
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      )}

      {user?.skills?.length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {user.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* <div className="flex justify-between border-t border-border pt-4">
        <div>
          <p className="font-mono text-lg font-semibold text-foreground">
            {stats?.credentials ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">Credentials</p>
        </div>
        <div>
          <p className="font-mono text-lg font-semibold text-foreground">
            {stats?.issuers ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">Verified issuers</p>
        </div>
      </div> */}
    </div>
  );
}
