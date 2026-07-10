import { Sparkles } from 'lucide-react';
import { Badge, Card } from '@/shared/ui';
import ProfileCard from './ProfileCard';

export default function ProfileResults({ users }) {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Showing {users?.length} learners
          </p>
          <p className="text-sm text-muted-foreground">
            A premium, scroll-ready feed for future expansion.
          </p>
        </div>
        <Badge variant="outline" className="rounded-full">
          <Sparkles className="mr-1 h-3.5 w-3.5" />
          Curated feed
        </Badge>
      </div>

      {users?.length === 0 ? (
        <Card className="rounded-3xl border border-dashed border-border/80 bg-card/70 p-10 text-center shadow-[var(--shadow-card)]">
          <p className="text-lg font-semibold text-foreground">
            No learners match that filter yet.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a broader keyword or switch to a different view.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {users?.map((person) => (
            <ProfileCard key={person._id} person={person} />
          ))}
        </div>
      )}
    </>
  );
}
