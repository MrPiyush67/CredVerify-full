import React from 'react';
import { Mail, Phone, Globe, Linkedin, Github, X } from 'lucide-react';
import { BentoCard } from './BentoGrid';

const SOCIAL_CONFIGS = {
  linkedin: {
    icon: Linkedin,
    bgColor: 'bg-blue-600',
    shadow: 'shadow-blue-600/20'
  },
  github: {
    icon: Github,
    bgColor: 'bg-gray-900',
    shadow: 'shadow-gray-900/20'
  },
  twitter: {
    icon: X,
    bgColor: 'bg-black',
    shadow: 'shadow-black/20'
  },
  portfolio: {
    icon: Globe,
    bgColor: 'bg-pink-500',
    shadow: 'shadow-pink-500/20'
  }
};

export const ContactCard = ({ user }) => {
  const socialLinks = user.socialLinks || {};

  return (
    <BentoCard title="Connect" icon={Globe} className="col-span-1 md:col-span-1 lg:col-span-1" delay={0.1}>
      <div className="space-y-4">
        <div className="space-y-3">
          <a href={`mailto:${user.email}`} className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-500 group-hover:text-blue-600 mr-3">
              <Mail size={16} />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-gray-500 font-medium">Email</p>
              <p className="text-sm text-gray-900 truncate font-medium">{user.email}</p>
            </div>
          </a>

          {user.phoneNo && (
            <div className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-500 group-hover:text-green-600 mr-3">
                <Phone size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Phone</p>
                <p className="text-sm text-gray-900 font-medium">{user.phoneNo}</p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Socials</p>
          <div className="flex gap-2">
            {Object.entries(socialLinks).map(([platform, url]) => {
              const config = SOCIAL_CONFIGS[platform];
              if (!config || !url) return null;

              const Icon = config.icon;
              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 ${config.bgColor} text-white rounded-xl hover:scale-110 transition-transform shadow-md ${config.shadow}`}
                  aria-label={platform}
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </BentoCard>
  );
};
