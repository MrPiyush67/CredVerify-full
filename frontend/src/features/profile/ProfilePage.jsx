import { ProfileSidebar } from './components/ProfileSidebar';
import { CredentialsSection } from './components/CredentialsSection.jsx';
import { ExperienceSection } from './components/ExperienceSection.jsx';
import { EducationSection } from './components/EducationSection.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import ProfilePageSkeleton from './components/ProfilePageSkeleton.jsx';
import { useGetUser } from './profileHooks.js';
import { useParams } from 'react-router';

// Placeholder raw Credential documents (shape matches the real schema) —
// replace with a fetch against your Credential collection, filtered by user id.
const credentials = [
  {
    _id: '1',
    title: 'Smart India Hackathon 2025 — National Finalist',
    issuer: 'Ministry of Education, Govt. of India',
    organizationName: '',
    type: 'other',
    issueDate: '2025-12-10',
    credentialId: 'SIH25-4471',
    verificationStatus: 'VERIFIED',
    isOrganizationVerified: false,
    description:
      'National finalist among 90,000+ teams for an AI-powered certificate verification platform.',
    skills: ['System Design', 'AI/ML'],
    file: { url: '' },
  },
  {
    _id: '2',
    title: 'Full-Stack Web Development',
    issuer: 'CredVerify Academy',
    type: 'certificate',
    issueDate: '2025-08-02',
    credentialId: 'CVA-88213',
    verificationStatus: 'VERIFIED',
    isOrganizationVerified: true,
    organizationName: 'CredVerify Academy',
    description:
      'Covers React, Node.js, MongoDB, and production deployment practices.',
    skills: ['React', 'Node.js', 'MongoDB'],
    totalHours: 120,
    file: { url: '' },
  },
  {
    _id: '3',
    title: 'Data Structures & Algorithms',
    issuer: 'NIT Bhopal',
    type: 'micro_credential',
    issueDate: '2026-06-20',
    credentialId: 'NITB-DSA-26',
    verificationStatus: 'REVIEW_REQUIRED',
    isOrganizationVerified: false,
    skills: ['DSA', 'Java'],
    file: { url: '' },
  },
];
const user = {
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

export default function ProfilePage() {
  const { username } = useParams();
  const { data: user, isPending } = useGetUser(username);

  if (isPending) return <ProfilePageSkeleton />;
  return (
    <div className="flex gap-6">
      <div className="flex ml-4 gap-6 sticky top-6 self-start shrink-0 w-72">
        <ProfileSidebar user={user} />
        <Separator orientation="vertical" className="h-120 mt-15" />
      </div>
      <div className="space-y-6 flex-1">
        <CredentialsSection credentials={credentials} />
        <ExperienceSection experience={user?.experience} />
        <EducationSection education={user?.education} />
      </div>
    </div>
  );
}
