import { Badge } from '@/components/ui/badge.jsx';
import { BriefcaseBusiness, Building2, Calendar } from 'lucide-react';

function formatRange(start, end, current) {
  const options = {
    month: 'short',
    year: 'numeric',
  };

  const startDate = start
    ? new Date(start).toLocaleDateString('en-US', options)
    : '';

  const endDate = current
    ? 'Present'
    : end
      ? new Date(end).toLocaleDateString('en-US', options)
      : '';

  return [startDate, endDate].filter(Boolean).join(' • ');
}

export function ExperienceSection({ experience = [] }) {
  return (
    <section>
      {/* Header */}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Experience{' '}
          <span className="font-mono font-normal text-muted-foreground">
            ({experience.length})
          </span>
        </h2>
      </div>

      {experience.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12">
          <BriefcaseBusiness className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No experience added yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {experience.map((job, index) => (
            <div
              key={index}
              className="group rounded-xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
            >
              {/* Top */}

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-semibold">
                    {job.position}
                  </h3>

                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />

                    <span className="truncate">{job.company}</span>
                  </div>
                </div>

                <Badge variant="outline" className="gap-1 shrink-0">
                  <Calendar className="h-3 w-3" />

                  {formatRange(job.startDate, job.endDate, job.current)}
                </Badge>
              </div>

              {/* Description */}

              {job.description && (
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {job.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
