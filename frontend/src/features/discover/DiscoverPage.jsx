import { useState } from 'react';
import { getUsers } from './discoverHooks.js';
import Filters from './components/Filters.jsx';
import Toolbar from './components/Toolbar.jsx';
import UserCard from './components/UserCard.jsx';
import DiscoverPageSkeleton from './components/DiscoverPageSkeleton.jsx';

export default function DiscoverPage() {
  const [showFilters, setShowFilters] = useState(false);
  const { data: users, isPending } = getUsers({ skip: 0, limit: 20 });

  if (isPending) return <DiscoverPageSkeleton />;
  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Toolbar showFilters={showFilters} setShowFilters={setShowFilters} />

      {/* Filters */}
      <Filters showFilters={showFilters} />

      {/* Users */}
      <div className="space-y-4">
        {users?.map((user) => (
          <UserCard user={user} />
        ))}
      </div>
    </div>
  );
}
