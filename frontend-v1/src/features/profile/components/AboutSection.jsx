import { FileText } from 'lucide-react';
import ProfileSection from './ProfileSection';

export default function AboutSection({ bio }) {
  if (!bio) return null;

  return (
    <ProfileSection title="About" icon={FileText}>
      <p className="leading-8 text-muted-foreground">{bio}</p>
    </ProfileSection>
  );
}
