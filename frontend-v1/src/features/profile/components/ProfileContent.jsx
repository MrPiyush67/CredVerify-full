import AboutSection from './AboutSection';
import EducationSection from './EducationSection';
import ExperienceSection from './ExperienceSection';

export default function ProfileContent({ profile }) {
  return (
    <section className="space-y-10 lg:col-span-8">
      <AboutSection bio={profile.bio} />

      <ExperienceSection experience={profile.experience} />

      <EducationSection education={profile.education} />
    </section>
  );
}
