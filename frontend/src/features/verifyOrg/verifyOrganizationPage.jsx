import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  Search,
  Globe,
  Mail,
  Users,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ExternalLink,
  Crown,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { OrgListRow } from './components/OrgListRow.jsx';
import { StatusBadge } from './components/StatusBadge.jsx';

// Placeholder raw Organization documents (shape matches the real schema) —
// replace with a fetch against your Organization collection.
const PLACEHOLDER_ORGANIZATIONS = [
  {
    _id: '6a5b8555a9ca46f3b28465a7',
    name: 'Infosys Springboard',
    isRoot: false,
    type: 'company',
    logo: '',
    banner: '',
    description: 'Infosys digital learning platform',
    website: 'https://infyspringboard.onwingspan.com',
    email: 'admin@infosysspringboard.com',
    verificationStatus: 'pending',
    verifiedAt: '2026-07-18T00:00:00.000Z',
    credentialCount: 0,
    memberCount: 0,
    isActive: true,
  },
  {
    _id: 'o2',
    name: 'NIT Bhopal',
    isRoot: true,
    type: 'university',
    logo: '',
    banner: '',
    description: 'National Institute of Technology, Bhopal',
    website: 'https://manit.ac.in',
    email: 'registrar@manit.ac.in',
    verificationStatus: 'verified',
    verifiedAt: '2026-05-02T00:00:00.000Z',
    credentialCount: 1240,
    memberCount: 86,
    isActive: true,
  },
  {
    _id: 'o3',
    name: 'SkillBridge Academy',
    isRoot: false,
    type: 'training_provider',
    logo: '',
    banner: '',
    description: 'Short-term vocational and skill certification courses',
    website: 'https://skillbridge.example.com',
    email: 'contact@skillbridge.example.com',
    verificationStatus: 'pending',
    verifiedAt: null,
    credentialCount: 0,
    memberCount: 0,
    isActive: true,
  },
  {
    _id: 'o4',
    name: 'QuickCerts Ltd',
    isRoot: false,
    type: 'company',
    logo: '',
    banner: '',
    description: 'Rapid certificate issuance for online bootcamps',
    website: 'https://quickcerts.example.com',
    email: 'hello@quickcerts.example.com',
    verificationStatus: 'rejected',
    verifiedAt: null,
    credentialCount: 0,
    memberCount: 0,
    isActive: false,
  },
];

const TYPE_META = {
  company: { label: 'Company', icon: Building2 },
  university: { label: 'University', icon: ShieldCheck },
  training_provider: { label: 'Training Provider', icon: FileCheck2 },
  government: { label: 'Government Body', icon: Crown },
};



const STATUS_TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'verified', label: 'Verified' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
];

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}



export default function VerifyOrganizationsPage({
  organizations: initialOrgs = PLACEHOLDER_ORGANIZATIONS,
}) {
  const [orgs, setOrgs] = useState(initialOrgs);
  const [tab, setTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(initialOrgs[0]?._id ?? null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = useMemo(() => {
    return orgs.filter((o) => {
      const matchesTab = tab === 'all' || o.verificationStatus === tab;
      const matchesSearch =
        !search.trim() ||
        o.name.toLowerCase().includes(search.trim().toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [orgs, tab, search]);

  const selected =
    orgs.find((o) => o._id === selectedId) ?? filtered[0] ?? null;

  const counts = useMemo(() => {
    const c = { all: orgs.length };
    orgs.forEach((o) => {
      c[o.verificationStatus] = (c[o.verificationStatus] ?? 0) + 1;
    });
    return c;
  }, [orgs]);

  const updateStatus = (id, status) => {
    setOrgs((prev) =>
      prev.map((o) =>
        o._id === id
          ? {
              ...o,
              verificationStatus: status,
              verifiedAt:
                status === 'verified' ? new Date().toISOString() : o.verifiedAt,
            }
          : o,
      ),
    );
  };

  const handleReject = () => {
    if (rejectTarget) updateStatus(rejectTarget._id, 'rejected');
    setRejectTarget(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Verify Organizations
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Review organization details and approve or reject their verification
          request.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        {/* List */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search organizations..."
              className="pl-9"
            />
          </div>

          <div className="flex gap-1 rounded-lg bg-muted p-1">
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
                {counts[key] > 0 && (
                  <span className="ml-1 tabular-nums">({counts[key]})</span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
                No organizations here.
              </div>
            ) : (
              filtered.map((org) => (
                <OrgListRow
                  key={org._id}
                  org={org}
                  isActive={selected?._id === org._id}
                  onClick={() => setSelectedId(org._id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-fit rounded-2xl border border-border bg-card p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 rounded-xl after:rounded-xl">
                    <AvatarImage src={selected.logo} alt={selected.name} />
                    <AvatarFallback className="rounded-xl text-lg font-medium text-muted-foreground">
                      {getInitials(selected.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-lg font-semibold text-foreground">
                        {selected.name}
                      </h2>
                      {selected.isRoot && (
                        <Badge
                          variant="outline"
                          className="gap-1 border-amber-200 bg-amber-50 text-amber-700"
                        >
                          <Crown className="h-3 w-3" />
                          Root org
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                      {(() => {
                        const typeMeta =
                          TYPE_META[selected.type] ?? TYPE_META.company;
                        const TypeIcon = typeMeta.icon;
                        return (
                          <>
                            <TypeIcon className="h-3.5 w-3.5" />
                            {typeMeta.label}
                          </>
                        );
                      })()}
                    </p>
                  </div>
                </div>
                <StatusBadge status={selected.verificationStatus} />
              </div>

              {selected.description && (
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {selected.description}
                </p>
              )}

              <Separator className="my-6" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-foreground">
                    {selected.email || '—'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {selected.website ? (
                    <a
                      href={selected.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 truncate text-primary hover:underline"
                    >
                      {selected.website.replace(/^https?:\/\//, '')}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-foreground">
                    {selected.memberCount} members
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <FileCheck2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-foreground">
                    {selected.credentialCount} credentials issued
                  </span>
                </div>
              </div>

              {selected.verifiedAt &&
                selected.verificationStatus === 'verified' && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Verified on {formatDate(selected.verifiedAt)}
                  </p>
                )}

              {selected.verificationStatus === 'pending' && (
                <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
                  <Button
                    onClick={() => updateStatus(selected._id, 'verified')}
                    className="gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Verify organization
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setRejectTarget(selected)}
                    className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}

              {selected.verificationStatus === 'rejected' && (
                <div className="mt-8 border-t border-border pt-6">
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selected._id, 'pending')}
                    className="gap-1.5"
                  >
                    <Clock className="h-4 w-4" />
                    Move back to pending
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
              Select an organization to review
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Reject confirmation */}
      <AlertDialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject {rejectTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This organization won't be able to issue verified credentials. You
              can add a reason below — it'll be visible to them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection (optional)"
            className="min-h-20"
          />
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setRejectTarget(null);
                setRejectReason('');
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleReject}
            >
              Reject organization
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
