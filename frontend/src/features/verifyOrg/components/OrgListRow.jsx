import { Building2, FileCheck2, ShieldCheck, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge } from './StatusBadge.jsx';

const TYPE_META = {
  company: { label: 'Company', icon: Building2 },
  university: { label: 'University', icon: ShieldCheck },
  training_provider: { label: 'Training Provider', icon: FileCheck2 },
  government: { label: 'Government Body', icon: Crown },
};
function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function OrgListRow({ org, isActive, onClick }) {
  const typeMeta = TYPE_META[org.type] ?? TYPE_META.company;
  const TypeIcon = typeMeta.icon;

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
        isActive
          ? 'border-primary bg-primary/[0.04] shadow-sm'
          : 'border-border hover:border-primary/40 hover:bg-muted/40'
      }`}
    >
      <Avatar className="h-10 w-10 shrink-0 rounded-xl after:rounded-xl">
        <AvatarImage src={org.logo} alt={org.name} />
        <AvatarFallback className="text-xs font-medium rounded-xl text-muted-foreground">
          {getInitials(org.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p
            className={`truncate text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}
          >
            {org.name}
          </p>
          {org.isRoot && (
            <Crown className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          )}
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <TypeIcon className="h-3 w-3" />
          {typeMeta.label}
        </p>
      </div>
      <StatusBadge status={org.verificationStatus} />
    </button>
  );
}
