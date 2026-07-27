import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  QrCode,
  Puzzle,
  FolderKey,
  Link as LinkIcon,
  Building2,
  Clock,
  ArrowRight,
  Zap,
  ShieldCheck,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import CertificateQrUploadModal from './components/CertificateQrUploadModal.jsx';
import LinkVerificationModal from './components/LinkVerificationModal.jsx';
import OrganizationVerificationModal from './components/OrganizationVerificationModal.jsx';
import PlatformVerificationModal from './components/PlatformVerificationModal.jsx';
import DigilockerModal from './components/DigilockerModal.jsx';
import ExtensionInstallModal from './components/ExtensionInstallModal.jsx';

const METHODS = [
  {
    id: 'extension',
    title: 'Browser Extension',
    description: 'Auto-detect certificates while you browse',
    icon: Puzzle,
    time: '30 sec / certificate',
    speed: 'Instant',
    bestFor: 'online courses & coding platforms',
    steps: [
      {
        title: 'Install the extension',
        description:
          'Add Credify from the Chrome Web Store or Firefox Add-ons.',
      },
      {
        title: 'Browse as usual',
        description:
          'Visit HackerRank, Coursera, NPTEL, LinkedIn Learning, and more.',
      },
      {
        title: 'Auto-detected',
        description:
          'The extension highlights certificates it finds on the page.',
      },
      {
        title: 'One-click import',
        description:
          'Click the extension icon to send it straight to your profile.',
      },
    ],
  },
  {
    id: 'organization',
    title: 'Organization Verification',
    description: 'Get your institution to confirm it directly',
    icon: Building2,
    time: '2–5 business days',
    speed: 'Slow',
    bestFor: 'degrees, diplomas, institutional certs',
    steps: [
      {
        title: 'Select your institution',
        description: 'Choose from our database of verified institutions.',
      },
      {
        title: 'Upload the certificate',
        description: 'PDF or image of your degree or diploma.',
      },
      {
        title: 'Fill in the details',
        description: 'Degree name, roll number, graduation year.',
      },
      {
        title: 'Institutional review',
        description:
          "The institution's regulator checks it against their records.",
      },
      {
        title: 'Verified badge',
        description: 'Once approved, your credential is marked verified.',
      },
    ],
  },
  {
    id: 'certificate',
    title: 'Certificate / QR Upload',
    description: 'Upload a PDF or scan a QR code',
    icon: QrCode,
    time: '2–3 min / certificate',
    speed: 'Fast',
    bestFor: 'government & skill-training certificates',
    steps: [
      {
        title: 'Choose upload type',
        description: 'PDF upload, or scan the QR code with your camera.',
      },
      {
        title: 'Upload or scan',
        description:
          'Drag and drop the file, or point your camera at the code.',
      },
      {
        title: 'Data extracted',
        description:
          'Title, issuer, date, and credential ID are read automatically.',
      },
      {
        title: 'Review the details',
        description: 'Correct anything the system got wrong before submitting.',
      },
      {
        title: 'Validated',
        description:
          "Checked against the issuer's database or blockchain record.",
      },
    ],
  },
  {
    id: 'link',
    title: 'Link Verification',
    description: 'Paste a public verification URL',
    icon: LinkIcon,
    time: '1 min / certificate',
    speed: 'Instant',
    bestFor: 'digital badges, public certifications',
    steps: [
      {
        title: 'Copy the link',
        description: 'From your certificate email or issuing platform.',
      },
      {
        title: 'Paste it in',
        description: 'Drop the verification URL into Credify.',
      },
      {
        title: 'We fetch and validate',
        description: "Pulled directly from the issuer's server.",
      },
      {
        title: 'Added to your profile',
        description: 'Verified and imported — no file needed.',
      },
    ],
  },
  {
    id: 'digilocker',
    title: 'DigiLocker',
    description: 'Import verified government documents',
    icon: FolderKey,
    time: '2–3 min setup',
    speed: 'Fast',
    bestFor: 'government & identity documents',
    steps: [
      {
        title: 'Connect DigiLocker',
        description: 'Authorize Credify to access your account.',
      },
      {
        title: 'Select documents',
        description: 'Choose which certificates to bring in.',
      },
      {
        title: 'Imported automatically',
        description: 'Documents come in with government verification attached.',
      },
      {
        title: 'Verified badge',
        description: 'Government-verified status applies immediately.',
      },
    ],
  },
];

const SPEED_META = {
  Instant: { icon: Zap, className: 'text-emerald-700 bg-emerald-50' },
  Fast: { icon: Zap, className: 'text-blue-700 bg-blue-50' },
  Slow: { icon: Clock, className: 'text-amber-700 bg-amber-50' },
};

export default function AddCredentialsPage() {
  const [selectedId, setSelectedId] = useState(METHODS[0].id);
  const [activeModal, setActiveModal] = useState(null);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState(null);

  const selected = METHODS.find((m) => m.id === selectedId);
  const openModal = (id) => setActiveModal(id);
  const closeModal = () => setActiveModal(null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Add Credentials
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Pick a method below to see exactly how it works, then start building
          your verified credential portfolio.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        {/* Method selector rail */}
        <div className="space-y-2">
          {METHODS.map((method) => {
            const Icon = method.icon;
            const isActive = method.id === selectedId;
            return (
              <button
                key={method.id}
                onClick={() => setSelectedId(method.id)}
                className={`group flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  isActive
                    ? 'border-primary bg-primary/[0.04] shadow-sm'
                    : 'border-border hover:border-primary/40 hover:bg-muted/40'
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground group-hover:text-primary'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}
                    >
                      {method.title}
                    </span>
                    {isActive && (
                      <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                    {method.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-border bg-card p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <selected.icon className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {selected.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selected.description}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => openModal(selected.id)}
                className="gap-1.5"
              >
                <Play className="h-4 w-4" />
                Start
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {(() => {
                const speedMeta = SPEED_META[selected.speed] ?? SPEED_META.Fast;
                const SpeedIcon = speedMeta.icon;
                return (
                  <Badge
                    variant="secondary"
                    className={`gap-1.5 ${speedMeta.className}`}
                  >
                    <SpeedIcon className="h-3.5 w-3.5" />
                    {selected.speed}
                  </Badge>
                );
              })()}
              <Badge variant="secondary" className="gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {selected.time}
              </Badge>
              <Badge variant="secondary" className="gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Best for {selected.bestFor}
              </Badge>
            </div>

            <div className="mt-8">
              <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                How it works
              </p>
              <div className="relative space-y-5 pl-2">
                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
                {selected.steps.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative flex gap-4"
                  >
                    <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-semibold text-primary">
                      {i + 1}
                    </span>
                    <div className="pt-1">
                      <p className="text-sm font-medium text-foreground">
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- Modals --- */}
      <CertificateQrUploadModal
        isOpen={activeModal === 'certificate'}
        onClose={closeModal}
      />
      <LinkVerificationModal
        isOpen={activeModal === 'link'}
        onClose={closeModal}
      />
      <OrganizationVerificationModal
        isOpen={activeModal === 'organization'}
        onClose={closeModal}
      />
      <DigilockerModal
        isOpen={activeModal === 'digilocker'}
        onClose={closeModal}
      />
      <ExtensionInstallModal
        isOpen={activeModal === 'extension'}
        onClose={closeModal}
      />
      <PlatformVerificationModal
        isOpen={activeModal === 'platform'}
        onClose={closeModal}
        platform="leetcode"
        handle="demo_handle"
        platformName="LeetCode"
      />

      <AlertDialog
        open={!!confirmDeleteTarget}
        onOpenChange={(open) => !open && setConfirmDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this profile link? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            Your {confirmDeleteTarget?.name} profile link will be removed.
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDeleteTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => setConfirmDeleteTarget(null)}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
