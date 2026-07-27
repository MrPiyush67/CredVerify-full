import { ArrowRight, ShieldCheck, Clock3 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router';

export function CredentialCard({ credential }) {
  const {
    title,
    issuer,
    date,
    thumbnail,
    verified,
    type,
    skills = [],
  } = credential;

  return (
    <Card className="group w-[290px] shrink-0 overflow-hidden rounded-xl border bg-card py-0 transition-all duration-800 hover:-translate-y-1 hover:shadow-lg">
      {/* Thumbnail */}

      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={thumbnail}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-800 group-hover:scale-105 dark:opacity-70"
        />

        <div className="absolute right-3 top-3">
          {verified ? (
            <Badge className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <Clock3 className="h-3 w-3" />
              Pending
            </Badge>
          )}
        </div>
      </div>

      {/* Body */}

      <div className="flex flex-col gap-4 p-5">
        {/* Title */}

        <div>
          <h3 className="line-clamp-2 text-base font-semibold leading-tight">
            {title}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">{issuer}</p>
        </div>

        {/* Metadata */}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{type}</span>

          <span>{date}</span>
        </div>

        {/* Skills */}

        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 3).map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="rounded-md text-[11px]"
            >
              {skill}
            </Badge>
          ))}
        </div>

        {/* Footer */}

        <Button variant="ghost" className="justify-between" asChild>
          <Link to={`/credentials/${credential.id}`}>
            View Credential
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
