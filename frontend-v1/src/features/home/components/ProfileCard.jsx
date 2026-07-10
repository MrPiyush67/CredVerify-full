import {
  ArrowRight,
  BriefcaseBusiness,
  Clock3,
  GraduationCap,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { Badge, Button, Card, ProfileImage } from '@/shared/ui';

const formatRole = (role = '') =>
  role.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) ||
  'Profile';

const formatDate = (value) => {
  if (!value) return 'recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'recently';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const formatEducation = (item) => {
  if (typeof item === 'string') return item;
  if (!item) return '';

  const parts = [item.degree, item.fieldOfStudy].filter(Boolean);
  const institution = item.institution;

  if (parts.length && institution)
    return `${parts.join(' • ')} · ${institution}`;
  if (parts.length) return parts.join(' • ');
  return institution || '';
};

const formatExperience = (item) => {
  if (typeof item === 'string') return item;
  if (!item) return '';

  const parts = [item.position, item.company].filter(Boolean);
  return parts.join(' at ');
};

export default function ProfileCard({ person }) {
  const roleLabel = formatRole(person?.role);
  const isActive = person?.isActive !== false;
  const isPublic = person?.isPublic !== false;
  const headline =
    person?.bio || person?.headline || 'Verified professional profile';
  const skills = Array.isArray(person?.skills) ? person.skills : [];
  const primaryEducation = person?.education?.[0];
  const primaryExperience = person?.experience?.[0];
  const lastSeenLabel = person?.lastSeen
    ? `Last seen ${formatDate(person.lastSeen)}`
    : person?.updated
      ? `Updated ${person.updated}`
      : 'Recently updated';

  return (
    <Card className="group rounded-[1.75rem] border border-border/80 bg-card/95 p-6 shadow-(--shadow-card) transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_55px_-18px_rgba(15,23,42,0.25)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <ProfileImage
            src={person?.avatar}
            name={person?.name}
            title={person?.username || person?.role}
            className="h-12 w-12 border-2 border-background shadow-sm"
            fallbackClassName="bg-linear-to-br from-primary to-primary/70 text-sm font-semibold text-primary-foreground"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                {person?.name || 'Unnamed profile'}
              </h2>
              <Badge variant="outline" className="rounded-full">
                {roleLabel}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{headline}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Badge
            variant={isActive ? 'outline' : 'secondary'}
            className="rounded-full"
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-primary/20 bg-primary/5 text-primary"
          >
            {isPublic ? 'Public' : 'Private'}
          </Badge>
        </div>
      </div>

      <div className="mt-5 grid gap-2 rounded-[1.25rem] border border-border/70 bg-surface-elevated/70 p-3">
        {primaryEducation && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{formatEducation(primaryEducation)}</span>
          </div>
        )}

        {primaryExperience && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{formatExperience(primaryExperience)}</span>
          </div>
        )}

        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{lastSeenLabel}</span>
        </div>
      </div>

      {skills.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="outline" className="rounded-full">
              {skill}
            </Badge>
          ))}
          {skills.length > 4 && (
            <Badge variant="secondary" className="rounded-full">
              +{skills.length - 4} more
            </Badge>
          )}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isPublic ? (
            <ShieldCheck className="h-4 w-4 text-primary" />
          ) : (
            <Lock className="h-4 w-4 text-primary" />
          )}
          <span>{isPublic ? 'Visible to others' : 'Limited visibility'}</span>
        </div>
        <Button
          variant="ghost"
          className="rounded-full px-0 text-sm font-semibold text-primary"
        >
          View profile
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
