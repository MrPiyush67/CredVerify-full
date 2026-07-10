import {
  ArrowRight,
  Github,
  Globe,
  Linkedin,
  MapPin,
  Pencil,
} from 'lucide-react';
import { Button, ProfileImage } from '@/shared/ui';
import { formatRole } from '../utils/profileUtils';
import ProfileActions from './ProfileActions.jsx';

export default function ProfileHero({ profile, isOwner = false, onEdit }) {
  return (
    <section className="rounded-3xl border-border/80 shadow-[var(--shadow-card)] bg-card p-6">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        {/* Left */}
        <div className="flex flex-col gap-6 sm:flex-row">
          <ProfileImage
            src={profile.avatar}
            name={profile.name}
            title={profile.username}
            className="h-24 w-24 border-4 border-background shadow-md"
            fallbackClassName="bg-primary/15 text-3xl font-semibold text-primary"
          />

          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                {profile.name}
              </h1>

              <p className="mt-1 text-muted-foreground">@{profile.username}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{formatRole(profile.role)}</span>

              {profile.location && (
                <>
                  <span>•</span>

                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              {profile.socialLinks?.github && (
                <a
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="h-5 w-5 text-muted-foreground transition hover:text-foreground" />
                </a>
              )}

              {profile.socialLinks?.linkedin && (
                <a
                  href={profile.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Linkedin className="h-5 w-5 text-muted-foreground transition hover:text-foreground" />
                </a>
              )}

              {profile.socialLinks?.portfolio && (
                <a
                  href={profile.socialLinks.portfolio}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Globe className="h-5 w-5 text-muted-foreground transition hover:text-foreground" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <ProfileActions isOwner={isOwner} onEdit={onEdit} />
      </div>
    </section>
  );
}
