import ProfileContactCard from './ProfileContactCard';
import ProfileSkillsCard from './ProfileSkillsCard';
import ProfileLinksCard from './ProfileLinksCard';
import ProfileCredentialsCard from './ProfileCredentialsCard';

export default function ProfileSidebar({ profile, className = '' }) {
  return (
    <aside
      className={`${className} space-y-6 lg:sticky lg:top-24 lg:self-start`}
    >
      <ProfileContactCard profile={profile} />

      <ProfileSkillsCard skills={profile.skills} />

      <ProfileLinksCard socialLinks={profile.socialLinks} />

      <ProfileCredentialsCard credentials={profile.credentials} />
    </aside>
  );
}
