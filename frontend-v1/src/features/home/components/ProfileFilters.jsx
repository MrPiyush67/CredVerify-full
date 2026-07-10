import { useState } from 'react';
import {
  Search,
  Sparkles,
  BriefcaseBusiness,
  GraduationCap,
  SlidersHorizontal,
  ChevronDown,
  Clock3,
  BadgeCheck,
} from 'lucide-react';
import { Button, Card, Input } from '@/shared/ui';

const primaryFilters = [
  { key: 'all', label: 'All learners' },
  { key: 'recent', label: 'Recent activity' },
  { key: 'skills', label: 'Skill-rich' },
];

const skillChips = [
  'React',
  'Design',
  'Data',
  'Leadership',
  'Backend',
  'Product',
];
const roleChips = ['Developer', 'Designer', 'Analyst', 'Manager'];
const experienceChips = ['0-2 years', '3-5 years', '5+ years'];
const activityChips = ['Open to work', 'Recently active', 'Verified badges'];

export default function ProfileFilters({
  query,
  onQueryChange,
  activeFilter,
  onFilterChange,
  activeTag,
  onTagChange,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="rounded-[1.75rem] border border-border/80 bg-card/95 p-5 shadow-(--shadow-card)">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search by name, role, skill, education, or experience"
              className="pl-10"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-2 rounded-full"
            onClick={() => setIsExpanded((open) => !open)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </Button>
        </div>

        {isExpanded && (
          <div className="rounded-[1.25rem] border border-border/70 bg-surface-elevated/80 p-4">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {primaryFilters.map((filter) => (
                    <Button
                      key={filter.key}
                      variant={
                        activeFilter === filter.key ? 'default' : 'outline'
                      }
                      size="sm"
                      className="rounded-full"
                      onClick={() => onFilterChange(filter.key)}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <BriefcaseBusiness className="h-4 w-4 text-primary" />
                    Role focus
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {roleChips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => onTagChange(chip)}
                        className={`rounded-full border px-3 py-1 text-sm transition-colors ${activeTag === chip ? 'border-primary bg-primary/10 text-primary' : 'border-border/80 bg-surface-elevated text-foreground hover:border-primary/40'}`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Skills
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skillChips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => onTagChange(chip)}
                        className={`rounded-full border px-3 py-1 text-sm transition-colors ${activeTag === chip ? 'border-primary bg-primary/10 text-primary' : 'border-border/80 bg-surface-elevated text-foreground hover:border-primary/40'}`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Suggested filters
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {experienceChips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => onTagChange(chip)}
                        className={`rounded-full border px-3 py-1 text-sm transition-colors ${activeTag === chip ? 'border-primary bg-primary/10 text-primary' : 'border-border/80 bg-surface-elevated text-foreground hover:border-primary/40'}`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Clock3 className="h-4 w-4 text-primary" />
                    Activity
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activityChips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => onTagChange(chip)}
                        className={`rounded-full border px-3 py-1 text-sm transition-colors ${activeTag === chip ? 'border-primary bg-primary/10 text-primary' : 'border-border/80 bg-surface-elevated text-foreground hover:border-primary/40'}`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-3 py-2">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    Refine by verified credentials and recent activity.
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onTagChange('')}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
