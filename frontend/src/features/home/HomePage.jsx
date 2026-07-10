import React, { useMemo, useState } from 'react';
import { Loader, PageHeader } from '@/shared/ui';
import HomeHeroSection from '../components/HomeHeroSection.js';
import ProfileFilters from '../components/ProfileFilters.js';
import ProfileResults from '../components/ProfileResults.js';
import { useGetUsers } from '../hooks/homeHooks.js';

// const users = [
//   {
//     id: 1,
//     name: 'Ava Patel',
//     role: 'Data Analyst',
//     headline: 'Certified in analytics and business intelligence',
//     skills: ['SQL', 'Power BI', 'Python'],
//     credentials: 5,
//     updated: '2 days ago',
//     trustScore: '95%',
//     recent: true,
//     education: ['B.Tech in Computer Science'],
//     experience: ['Analytics Intern at Finora'],
//   },
//   {
//     id: 2,
//     name: 'Noah Kim',
//     role: 'Product Designer',
//     headline: 'Verified UX and prototyping credentials',
//     skills: ['Figma', 'Research', 'Design Systems'],
//     credentials: 4,
//     updated: '5 hours ago',
//     trustScore: '93%',
//     recent: true,
//     education: ['B.Des in Interaction Design'],
//     experience: ['Senior UI Designer at Northstar'],
//   },
//   {
//     id: 3,
//     name: 'Mina Rahman',
//     role: 'Frontend Engineer',
//     headline: 'Advanced web development and accessibility credentials',
//     skills: ['React', 'Accessibility', 'TypeScript'],
//     credentials: 3,
//     updated: '1 day ago',
//     trustScore: '88%',
//     recent: false,
//     education: ['M.Sc in Computer Science'],
//     experience: ['Frontend Engineer at Nivara'],
//   },
//   {
//     id: 4,
//     name: 'Liam Chen',
//     role: 'Project Manager',
//     headline: 'Leadership and agile delivery certification portfolio',
//     skills: ['Agile', 'Scrum', 'Leadership'],
//     credentials: 6,
//     updated: '7 days ago',
//     trustScore: '97%',
//     recent: true,
//     education: ['MBA in Operations'],
//     experience: ['Program Manager at Greenline'],
//   },
// ];

// const [query, setQuery] = useState('');
// const [activeFilter, setActiveFilter] = useState('all');
// const [activeTag, setActiveTag] = useState('');

// const filteredProfiles = useMemo(() => {
//   return learnerProfiles.filter((person) => {
//     const haystack = [
//       person.name,
//       person.headline,
//       person.role,
//       person.education?.join(' '),
//       person.experience?.join(' '),
//       person.skills.join(' '),
//     ]
//       .join(' ')
//       .toLowerCase();

//     const matchesQuery = haystack.includes(query.toLowerCase());
//     const matchesTag =
//       !activeTag ||
//       person.skills.some((skill) =>
//         skill.toLowerCase().includes(activeTag.toLowerCase()),
//       ) ||
//       person.role.toLowerCase().includes(activeTag.toLowerCase());
//     const matchesFilter =
//       activeFilter === 'all' ||
//       (activeFilter === 'recent' && person.recent) ||
//       (activeFilter === 'skills' && person.skills.length > 2);

//     return matchesQuery && matchesTag && matchesFilter;
//   });
// }, [query, activeFilter, activeTag]);
export default function HomePage() {
  const [filters, setFilters] = useState({
    skip: 0,
    limit: 20,
  });
  const { data: users, isPending } = useGetUsers(filters);
  if (isPending) return <Loader />;
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Discover learners"
        description="Search public learner profiles by name, skills, education, and experience."
      />

      <HomeHeroSection />
      {/* <ProfileFilters
        query={query}
        onQueryChange={setQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        activeTag={activeTag}
        onTagChange={setActiveTag}
      /> */}
      <ProfileResults users={users} />
    </main>
  );
}
