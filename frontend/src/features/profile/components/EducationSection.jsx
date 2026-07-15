import { Badge } from '@/components/ui/badge';
import { GraduationCap, Calendar, BookOpen } from 'lucide-react';

function formatRange(start, end, current) {
  if (!start) return '';

  return `${start} • ${current ? 'Present' : end}`;
}

export function EducationSection({ education = [] }) {
  return (
    <section>
      {/* Header */}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Education{' '}
          <span className="font-mono font-normal text-muted-foreground">
            ({education.length})
          </span>
        </h2>
      </div>

      {education.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12">
          <GraduationCap className="h-5 w-5 text-muted-foreground" />

          <p className="text-sm text-muted-foreground">
            No education added yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {education.map((entry, index) => (
            <div
              key={index}
              className="group rounded-xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
            >
              {/* Top */}

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-semibold">
                    {entry.institution}
                  </h3>

                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5 shrink-0" />

                    <span className="truncate">
                      {[entry.degree, entry.fieldOfStudy]
                        .filter(Boolean)
                        .join(' • ')}
                    </span>
                  </div>
                </div>

                <Badge variant="outline" className="shrink-0 gap-1">
                  <Calendar className="h-3 w-3" />

                  {formatRange(entry.startYear, entry.endYear, entry.current)}
                </Badge>
              </div>

              {entry.grade && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Grade:{' '}
                  <span className="font-medium text-foreground">
                    {entry.grade}
                  </span>
                </p>
              )}

              {entry.description && (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {entry.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
