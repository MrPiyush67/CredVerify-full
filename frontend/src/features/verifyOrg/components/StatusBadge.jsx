import { Badge } from '@/components/ui/badge.jsx';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
const STATUS_META = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  verified: {
    label: 'Verified',
    icon: CheckCircle2,
    className: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'text-red-700 bg-red-50 border-red-200',
  },
};

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  const Icon = meta.icon;
  return (
    <Badge variant="outline" className={`gap-1 ${meta.className}`}>
      <Icon className="h-3 w-3" />
      {meta.label}
    </Badge>
  );
}
