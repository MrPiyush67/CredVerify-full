import React, { useMemo } from 'react';
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  Link2,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Loader,
  PageHeader,
  ProfileImage,
} from '@/shared/ui';
import { useParams } from 'react-router';
import AiChatWrapper from '@/features/ai-chat/components/AiChatWrapper.jsx';
import { useGetUser } from '../hooks/profilehooks.js';
import ProfileHero from '../components/ProfileHero.jsx';
import ProfileContent from '../components/ProfileContent.jsx';
import ProfileSidebar from '../components/ProfileSidebar.jsx';

const profile = {
  _id: 'sample-1',
  name: 'Ava Patel',
  username: 'ava.patel',
  role: 'learner',
  bio: 'Building credible, verifiable digital work through strong technical foundations and hands-on project experience.',
  avatar: '',
  email: 'ava@credverify.app',
  phoneNo: '+91 98765 43210',
  isPublic: true,
  isActive: true,
  location: 'Bengaluru, India',
  skills: [
    'React',
    'Node.js',
    'TypeScript',
    'UX Research',
    'Data Visualization',
  ],
  education: [
    {
      institution: 'IIT Delhi',
      degree: 'B.Tech',
      fieldOfStudy: 'Computer Science',
      startYear: 2020,
      endYear: 2024,
      current: false,
    },
  ],
  experience: [
    {
      company: 'Finora Labs',
      position: 'Data Analyst Intern',
      startDate: '2023-06-01',
      endDate: '2023-12-01',
      current: false,
      description:
        'Built reporting pipelines and validated credential-backed analytics workflows.',
    },
  ],
  socialLinks: {
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    portfolio: 'https://portfolio.dev',
  },
  credentials: 5,
  lastSeen: '2026-07-02T10:00:00.000Z',
};

export default function ProfilePage() {
  const { username } = useParams();
  // const { data: profile, isPending, isError } = useGetUser(username);

  // if (isPending) return <Loader />;

  // if (isError)
  //   return (
  //     <div className="text-center text-red-500">Error loading profile.</div>
  //   );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <ProfileHero profile={profile} isOwner={false} />

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <ProfileContent profile={profile} />

        <ProfileSidebar profile={profile} className="lg:col-span-4" />
      </div>
      <AiChatWrapper />
    </main>
  );
}
