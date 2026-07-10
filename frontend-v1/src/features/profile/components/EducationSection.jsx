import { GraduationCap } from 'lucide-react';
import ProfileSection from './ProfileSection';

export default function EducationSection({ education = [] }) {
  if (!education.length) return null;

  return (
    <ProfileSection title="Education" icon={GraduationCap}>
      <div className="space-y-8">
        {education.map((item, index) => (
          <article
            key={`${item.institution}-${index}`}
            className="relative pl-6"
          >
            {/* timeline dot */}
            <span className="absolute left-0 top-2 h-3 w-3 rounded-full bg-primary" />

            {/* timeline line */}
            {index !== education.length - 1 && (
              <span className="absolute left-[5px] top-5 h-full w-px bg-border" />
            )}

            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {item.degree}
                {item.fieldOfStudy ? ` • ${item.fieldOfStudy}` : ''}
              </h3>

              <p className="text-muted-foreground">{item.institution}</p>

              <p className="text-sm text-muted-foreground">
                {item.startYear}
                {item.endYear ? ` – ${item.endYear}` : ''}
              </p>
            </div>
          </article>
        ))}
      </div>
    </ProfileSection>
  );
}
