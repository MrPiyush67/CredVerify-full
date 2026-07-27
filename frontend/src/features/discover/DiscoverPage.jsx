import { useState } from 'react';
import { useGetUsers } from './discoverHooks.js';
import Filters from './components/Filters.jsx';
import Toolbar from './components/Toolbar.jsx';
import UserCard from './components/UserCard.jsx';
import DiscoverPageSkeleton from './components/DiscoverSkeleton.jsx';
import { useGetMe } from '../auth/authHooks.js';

const STATUS_TABS = [
  { key: 'users', label: 'Users' },
  { key: 'organizations', label: 'Organizations' },
];

export default function DiscoverPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [tab, setTab] = useState('users');
  const { data: user } = useGetMe();
  const { data: users, isPending } = useGetUsers({ skip: 0, limit: 20 });

  if (isPending) return <DiscoverPageSkeleton />;
  return (
    <div className="space-y-6">
      {user?.organization && user?.role === 'regulator' && (
        <div className="flex gap-1 rounded-lg bg-muted p-1 w-60">
          {STATUS_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                tab === key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {tab === 'users' ? (
        <>
          {/* Toolbar */}
          <Toolbar showFilters={showFilters} setShowFilters={setShowFilters} />

          {/* Filters */}
          <Filters showFilters={showFilters} />

          {/* Users */}
          <div className="space-y-4">
            {users?.map((user) => (
              <UserCard key={user._id} user={user} />
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Organizations</h2>
          <p className="text-sm text-muted-foreground">
            No organizations found.
          </p>
        </div>
      )}
    </div>
  );
}
