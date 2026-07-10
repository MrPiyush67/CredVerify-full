import { Github, Globe, Linkedin } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui';

const ICONS = {
  github: Github,
  linkedin: Linkedin,
  portfolio: Globe,
};

export default function ProfileLinksCard({ socialLinks = {} }) {
  const links = Object.entries(socialLinks).filter(([, value]) => value);

  if (!links.length) return null;

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Links
        </h3>

        <div className="space-y-3">
          {links.map(([key, value]) => {
            const Icon = ICONS[key] || Globe;

            return (
              <a
                key={key}
                href={value}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-sm transition-colors hover:text-primary"
              >
                <Icon className="h-4 w-4" />
                <span className="capitalize">{key}</span>
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
