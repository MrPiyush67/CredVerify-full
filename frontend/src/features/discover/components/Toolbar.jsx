import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Filter, Search } from 'lucide-react';
import React from 'react';

const Toolbar = ({ showFilters, setShowFilters }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input placeholder="Search users..." className="pl-9" />
      </div>

      <Button
        variant={showFilters ? 'default' : 'outline'}
        onClick={() => setShowFilters((prev) => !prev)}
      >
        <Filter className="size-4" />
        Filters
      </Button>
    </div>
  );
};

export default Toolbar;
