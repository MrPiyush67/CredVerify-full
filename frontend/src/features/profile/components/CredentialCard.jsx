import { ShieldCheck, Clock3, ExternalLink } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const TYPE_LABELS = {
  certificate: 'Certificate',
  micro_credential: 'Micro Credential',
  degree: 'Degree',
  other: 'Credential',
};

function formatDate(date) {
  if (!date) return '';

  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export function CredentialCard({ credential }) {
  const {
    title,
    issuer,
    issueDate,
    type,
    skills = [],
    description,
    file,
    credentialCategory,
    isVerified,
    verifyUrl,
  } = credential;

  const thumbnail = file?.url || './credential.webp';

  return (
    <Card className="group overflow-hidden py-0 transition-all duration-200 hover:border-primary/40 hover:shadow-sm">
      <div className="flex h-[160px]">
        {/* Thumbnail */}

        <div className="w-[200px] shrink-0 border-r bg-muted">
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover dark:opacity-50"
          />
        </div>

        {/* Content */}

        <div className="flex min-w-0 flex-1 flex-col px-5 py-4">
          {/* Row 1 */}

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-semibold leading-none">
                {title}
              </h3>

              <p className="mt-1 truncate text-sm text-muted-foreground">
                {issuer}
              </p>
            </div>

            <Badge
              variant={isVerified ? 'default' : 'secondary'}
              className="shrink-0 gap-1"
            >
              {isVerified ? (
                <ShieldCheck className="h-3.5 w-3.5" />
              ) : (
                <Clock3 className="h-3.5 w-3.5" />
              )}

              {isVerified ? 'Verified' : 'Pending'}
            </Badge>
          </div>

          {/* Row 2 */}

          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{TYPE_LABELS[type]}</span>

            <span>•</span>

            <span>{formatDate(issueDate)}</span>

            {credentialCategory && (
              <>
                <span>•</span>
                <span>{credentialCategory}</span>
              </>
            )}
          </div>

          {/* Row 3 */}

          {description && (
            <p className="mt-3 line-clamp-1 text-sm text-muted-foreground">
              {description}
            </p>
          )}

          {/* Row 4 */}

          <div className="mt-auto flex items-end justify-between">
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 4).map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="rounded-md text-[11px]"
                >
                  {skill}
                </Badge>
              ))}
            </div>

            {verifyUrl && (
              <Button variant="ghost" size="sm" asChild>
                <a href={verifyUrl} target="_blank" rel="noreferrer">
                  View
                  <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
