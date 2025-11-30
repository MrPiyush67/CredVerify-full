import React from 'react';
import { MapPin } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@common/ui/Avatar.jsx';
import { Badge } from '@common/ui/Badge.jsx';
import { Button } from '@common/ui/Button.jsx';
import { ShieldCheck, Building2, User as UserIcon } from 'lucide-react';
import { BentoCard } from './BentoGrid';

export const IdentityCard = ({ user }) => {
  const getRoleIcon = () => {
    const iconProps = { className: "w-5 h-5" };
    const roleIcons = {
      validant: <ShieldCheck {...iconProps} className="w-5 h-5 text-green-600" />,
      curator: <Building2 {...iconProps} className="w-5 h-5 text-purple-600" />,
      credentialist: <UserIcon {...iconProps} className="w-5 h-5 text-blue-600" />
    };
    return roleIcons[user.role] || null;
  };

  return (
    <BentoCard className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2">
      <div className="h-full flex flex-col justify-center items-center text-center space-y-6 py-6">
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{user.name}</h1>
          <div className="flex items-center justify-center gap-3 mb-4">
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

        <div className="pt-4 flex gap-3 w-full max-w-xs">
          <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 rounded-xl h-11">
            Edit Profile
          </Button>
          <Button variant="outline" className="flex-1 border-gray-200 hover:bg-gray-50 rounded-xl h-11">
            Share
          </Button>
        </div>
      </div>
    </BentoCard>
  );
};
