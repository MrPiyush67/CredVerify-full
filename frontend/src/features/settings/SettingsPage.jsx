import { useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { SettingsHeader } from './components/SettingsHeader.jsx';
import { SettingsTabs } from './components/SettingsTabs.jsx';
import { PersonalTab } from './components/PersonalTab.jsx';
import { AccountTab } from './components/AccountTab.jsx';
import { SecurityTab } from './components/SecurityTab.jsx';
import { NotificationsTab } from './components/NotificationsTab.jsx';
import { SettingsPageSkeleton } from './components/SettingsPageSkeleton.jsx';
import { useGetMe } from '../auth/authHooks.js';

// Example shape — replace with the logged-in user from your auth/session layer.
const MOCK_USER = {
  username: 'emilyagrawal1',
  name: 'Emily Agrawal',
  email: 'emilyagrawal1@example.com',
  passwordHash: '$2b$10$7vXJ6rK1J0iQw7M9qLkL2uVtVh6xYJ5qQJ1x5mW4QqA0K5nD3F8aG',
  role: 'issuer',
  organization: 'org7',
  avatar: 'https://i.pravatar.cc/300?img=1',
  bio: 'Building reliable software and continuously learning new technologies.',
  phoneNo: '+91 9941971476',
  location: 'London, UK',
  socialLinks: {
    linkedin: 'https://linkedin.com/in/emilyagrawal1',
    github: 'https://github.com/emilyagrawal1',
    portfolio: 'https://emilyagrawal1.dev',
    website: 'https://emilyagrawal1.com',
  },
  education: [],
  experience: [
    {
      company: 'OpenAI',
      position: 'Software Engineer',
      startDate: '2023-01-01T00:00:00.000Z',
      endDate: null,
      current: true,
      description: 'Working on modern web applications.',
    },
  ],
  skills: ['MongoDB', 'SQL', 'React', 'Next.js', 'Linux'],
  isPublic: true,
  isActive: true,
  lastSeen: '2026-07-11T14:00:57.630856Z',
  createdAt: '2024-09-27T00:00:00Z',
  updatedAt: '2026-07-11T14:00:57.630939Z',
};

export default function SettingsPage() {
  const { data: user, isPending } = useGetMe();
  const [activeTab, setActiveTab] = useState('personal');

  const handleSavePersonal = async (data) => {
    // await fetch(`/api/users/${user._id}`, { method: 'PATCH', body: JSON.stringify(data) })
    console.log('save personal info', data);
  };

  const handleVisibilityChange = async (isPublic) => {
    // await fetch(`/api/users/${user._id}`, { method: 'PATCH', body: JSON.stringify({ isPublic }) })
    console.log('set visibility', isPublic);
  };

  const handleExportData = () => {
    console.log('export data requested');
  };

  const handleDeleteAccount = () => {
    console.log('delete account requested');
  };

  const handleChangePassword = (passwords) => {
    console.log('change password', passwords);
  };

  const handleViewSessions = () => {
    console.log('view sessions');
  };

  const handleNotificationsChange = (prefs) => {
    console.log('notification preferences', prefs);
  };

  if (isPending) return <SettingsPageSkeleton />;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SettingsHeader user={user} onAvatarChange={() => {}} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <SettingsTabs />
        <div className="mt-6">
          <PersonalTab user={user} onSave={handleSavePersonal} />
          <AccountTab
            user={user}
            onVisibilityChange={handleVisibilityChange}
            onExportData={handleExportData}
            onDeleteAccount={handleDeleteAccount}
          />
          <SecurityTab
            user={user}
            onChangePassword={handleChangePassword}
            onViewSessions={handleViewSessions}
          />
          <NotificationsTab onChange={handleNotificationsChange} />
        </div>
      </Tabs>
    </div>
  );
}
