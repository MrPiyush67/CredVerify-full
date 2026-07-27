import { CredentialsToolbar } from './components/CredentialsToolbar.jsx';
import { CredentialStats } from './components/CredentialStats.jsx';
import { CredentialCarousel } from './components/CredentialCarousel.jsx';
import ViewCredentialSkeleton from './components/ViewCredentialSkeleton.jsx';
import { FloatingAddCredentialButton } from './components/FloatingAddCredentialButton.jsx';

const MOCK_DATA = {
  Development: [
    {
      id: 1,
      title: 'React Developer Certification',
      issuer: 'Meta',
      date: 'Jun 2026',
      thumbnail:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      verified: true,
      type: 'Certificate',
      skills: ['React', 'JavaScript', 'HTML'],
    },
    {
      id: 2,
      title: 'AWS Cloud Practitioner',
      issuer: 'Amazon',
      date: 'Jan 2026',
      thumbnail:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
      verified: true,
      type: 'Certificate',
      skills: ['AWS', 'Cloud'],
    },
    {
      id: 3,
      title: 'Docker Essentials',
      issuer: 'Docker',
      date: 'Oct 2025',
      thumbnail:
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
      verified: true,
      type: 'Certificate',
      skills: ['Docker', 'Linux'],
    },
  ],

  Competitions: [
    {
      id: 4,
      title: 'Smart India Hackathon',
      issuer: 'Government of India',
      date: 'Dec 2025',
      thumbnail:
        'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800',
      verified: true,
      type: 'Competition',
      skills: ['AI', 'MERN'],
    },
    {
      id: 5,
      title: 'Flipkart GRID',
      issuer: 'Flipkart',
      date: 'Aug 2025',
      thumbnail:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      verified: true,
      type: 'Competition',
      skills: ['DSA', 'React'],
    },
  ],

  Cloud: [
    {
      id: 6,
      title: 'Microsoft Azure Fundamentals',
      issuer: 'Microsoft',
      date: 'Feb 2026',
      thumbnail:
        'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800',
      verified: true,
      type: 'Certificate',
      skills: ['Azure'],
    },
  ],
};

export default function ViewCredentialsPage({ isPending = false }) {
  if (isPending) return <ViewCredentialSkeleton />;
  return (
    <div className="space-y-6">
      <CredentialsToolbar />

      <CredentialStats total={28} verified={21} pending={4} categories={7} />

      {Object.entries(MOCK_DATA).map(([category, credentials]) => (
        <CredentialCarousel
          key={category}
          title={category}
          credentials={credentials}
        />
      ))}
      <FloatingAddCredentialButton />
    </div>
  );
}
