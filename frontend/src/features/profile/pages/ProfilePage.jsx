import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import {
  fetchUserProfile,
  fetchPublicProfile,
  selectUser,
  selectRoleProfile,
  selectProfileLoading,
  selectProfileError
} from '../redux/profileSlice.js';
import { fetchCredentials, selectCredentials } from '@features/credentials/redux/credentialsSlice';
import { selectUser as selectAuthUser } from '@features/auth/redux/authSlice';
import { Button, PageHeader } from '@common';
import { BentoGrid } from '../components/BentoGrid';
import { IdentityCard } from '../components/IdentityCard';
import { ContactCard } from '../components/ContactCard';
import { RoleDetailsCard } from '../components/RoleDetailsCard';
import { SkillsCard, ExperienceCard, EducationCard, AchievementsCard } from '../components/ProfileCards';
import { CredentialsCard } from '../components/CredentialsCard';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const role = searchParams.get('role');
  
  const user = useSelector(selectUser);
  const roleProfile = useSelector(selectRoleProfile);
  const isLoading = useSelector(selectProfileLoading);
  const error = useSelector(selectProfileError);
  const credentials = useSelector(selectCredentials);
  const authUser = useSelector(selectAuthUser);

  // Check if viewing own profile
  const isOwnProfile = !userId || (authUser && user && authUser._id === user._id);

  useEffect(() => {
    if (userId && role) {
      // Fetch public profile for the specified user
      dispatch(fetchPublicProfile({ userId, role }));
      // Don't fetch credentials for other users' profiles
    } else {
      // Fetch current user's own profile
      dispatch(fetchUserProfile());
      // Fetch credentials for own profile only
      dispatch(fetchCredentials({ page: 1, limit: 100 }));
    }
  }, [dispatch, userId, role]);

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pattern-grid-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="w-full">Try Again</Button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <PageHeader
        title={userId ? `${user.name || 'User'}'s Profile` : "My Profile"}
        description={userId ? "View Only" : "Overview"}
      >
        <div className="hidden md:block text-sm text-gray-500 font-medium">
          {userId && "(Read-only view)"}
          {!userId && `Last updated: ${new Date().toLocaleDateString()}`}
        </div>
      </PageHeader>

      <BentoGrid>
        {/* Row 1 & 2 */}
        <IdentityCard user={user} />
        <RoleDetailsCard user={user} roleProfile={roleProfile} />
        <ContactCard user={user} />
        <SkillsCard skills={user.skills} />

        {/* Row 3 & 4 */}
        <ExperienceCard experience={user.experience} />
        <EducationCard education={user.education} />
        <AchievementsCard achievements={user.achievements} />
        <CredentialsCard credentials={credentials} isOwnProfile={isOwnProfile} />
      </BentoGrid>
    </div>
  );
}

