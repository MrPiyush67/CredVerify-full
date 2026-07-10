import { BriefcaseBusiness } from 'lucide-react';
import ProfileSection from './ProfileSection';
import { formatDateRange } from '../utils/profileUtils.js';

export default function ExperienceSection({ experience = [] }) {
  if (!experience.length) return null;

  return (
    <ProfileSection title="Experience" icon={BriefcaseBusiness}>
      <div className="space-y-8">
        {experience.map((item, index) => (
          <article key={`${item.company}-${index}`} className="relative pl-6">
            {/* timeline dot */}
            <span className="absolute left-0 top-2 h-3 w-3 rounded-full bg-primary" />

            {/* timeline line */}
            {index !== experience.length - 1 && (
              <span className="absolute left-[5px] top-5 h-full w-px bg-border" />
            )}

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">{item.position}</h3>

              <p className="text-muted-foreground">{item.company}</p>

              <p className="text-sm text-muted-foreground">
                {formatDateRange(item.startDate, item.endDate, item.current)}
              </p>

              {item.description && (
                <p className="pt-2 leading-7 text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </ProfileSection>
  );
}
