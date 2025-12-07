import React, { useState } from 'react';
import { MapPin, Share2, Info } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@common/ui/Avatar.jsx';
import { Badge } from '@common/ui/Badge.jsx';
import { Button } from '@common/ui/Button.jsx';
import { ShieldCheck, Building2, User as UserIcon } from 'lucide-react';
import { BentoCard } from './BentoGrid';
import EditProfileModal from './EditProfileModal';

export const IdentityCard = ({ user, isOwnProfile = true }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showNameTooltip, setShowNameTooltip] = useState(false);

  const getRoleIcon = () => {
    const iconProps = { className: "w-5 h-5" };
    const roleIcons = {
      validant: <ShieldCheck {...iconProps} className="w-5 h-5 text-green-600" />,
      curator: <Building2 {...iconProps} className="w-5 h-5 text-purple-600" />,
      credentialist: <UserIcon {...iconProps} className="w-5 h-5 text-blue-600" />
    };
    return roleIcons[user.role] || null;
  };

  const handleShare = async () => {
    // Only allow sharing if profile is public
    if (!user.isPublic) {
      alert('Your profile must be public to share. Please update your visibility settings.');
      return;
    }

    const shareUrl = `${window.location.origin}/profile?userId=${user._id}&role=${user.role}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.name}'s Profile`,
          text: `Check out ${user.name}'s profile on CredVerify`,
          url: shareUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          navigator.clipboard.writeText(shareUrl);
          alert('Profile link copied to clipboard!');
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Profile link copied to clipboard!');
    }
  };

  return (
    <>
      <BentoCard className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2">
        <div className="h-full flex flex-col justify-center items-center text-center space-y-4">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg relative z-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-4xl bg-gray-100 text-gray-600">
                {user.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-1 right-1 z-20 bg-white rounded-full p-1.5 shadow-md border border-gray-100">
              {getRoleIcon()}
            </div>
          </div>

          <div>
            {/* Username - Large and prominent */}
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
              @{user.username}
            </h1>
            
            {/* Real Name - Smaller with tooltip */}
            <div 
              className="relative inline-block mb-3"
              onMouseEnter={() => setShowNameTooltip(true)}
              onMouseLeave={() => setShowNameTooltip(false)}
            >
              <p className="text-lg text-gray-600 font-medium">
                {user.name}
              </p>
              {showNameTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50">
                  <div className="flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Full name cannot be edited
                  </div>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-3 mb-3">
              <Badge variant="outline" className="capitalize px-3 py-1 text-sm font-medium border-gray-300 text-gray-700">
                {user.role}
              </Badge>
              {user.location && (
                <span className="flex items-center text-gray-500 text-sm">
                  <MapPin size={14} className="mr-1" /> {user.location}
                </span>
              )}
            </div>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed text-sm md:text-base">
              {user.bio || "No bio available."}
            </p>
          </div>

          <div className="pt-2 flex gap-3 w-full max-w-xs">
            {isOwnProfile && (
              <Button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 rounded-xl h-11"
              >
                Edit Profile
              </Button>
            )}
            <Button 
              onClick={handleShare}
              variant="outline" 
              className={`${isOwnProfile ? 'flex-1' : 'w-full'} border-gray-200 hover:bg-gray-50 rounded-xl h-11 gap-2 ${
                !user.isPublic ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!user.isPublic}
              title={!user.isPublic ? 'Profile must be public to share' : 'Share profile'}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </BentoCard>

      <EditProfileModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
      />
    </>
  );
};
