import { ShieldCheck } from 'lucide-react';
import { CredentialCard } from './CredentialCard.jsx';

// Maps the raw Credential document to only what the card needs, and derives
// a simple verified/pending flag from the model's actual verification fields.
function normalizeCredential(doc) {
  const isVerified =
    doc.verificationStatus === 'VERIFIED' ||
    doc.isOrganizationVerified === true;
  return {
    id: doc._id,
    title: doc.title,
    issuer: doc.organizationName || doc.issuer,
    issueDate: doc.issueDate,
    type: doc.type,
    credentialId: doc.credentialId,
    skills: doc.skills,
    description: doc.description,
    file: doc.file,
    credentialCategory: doc.credentialCategory,
    isVerified,
    verifyUrl: doc.file?.url || doc.sourceUrl || doc.courseUrl,
  };
}

export function CredentialsSection({ credentials = [] }) {
  // Rejected credentials aren't shown on the public profile at all.
  const visible = credentials
    .filter((c) => c.verificationStatus !== 'REJECTED')
    .map(normalizeCredential);

  return (
    <div className="rounded-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Credentials{' '}
          <span className="font-mono font-normal text-muted-foreground">
            ({visible.length})
          </span>
        </h2>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No verified credentials yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {visible.map((credential) => (
            <CredentialCard key={credential.id} credential={credential} />
          ))}
        </div>
      )}
    </div>
  );
}
