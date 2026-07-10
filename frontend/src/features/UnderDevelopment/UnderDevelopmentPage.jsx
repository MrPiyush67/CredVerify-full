import { Button } from '@/components/ui/button.jsx';

export default function UnderDevelopmentPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="mx-auto max-w-3xl text-center">
        <div className="flex gap-2 justify-center items-center">
          <img src="/logo.png" alt="CredVerify Logo" className="size-10" />
          <h1 className="text-5xl font-bold tracking-tight">CredVerify</h1>
        </div>

        <p className="mt-3 text-lg text-muted-foreground">
          Digital Credential Verification Platform
        </p>

        <div className="mt-10 inline-flex items-center rounded-full border bg-muted px-4 py-2 text-sm font-medium">
          🚧 Under Active Development
        </div>

        <p className="mx-auto mt-8 max-w-2xl leading-7 text-muted-foreground">
          CredVerify is currently undergoing active development. Authentication,
          dashboard architecture and organization workflows are complete, while
          credential issuance, verification and blockchain integration are still
          being implemented.
        </p>

        <div className="mt-10 rounded-xl border bg-card p-6 text-left">
          <h2 className="font-semibold">Current Progress</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>✅ Authentication</div>

            <div>✅ Responsive Dashboard</div>

            <div>✅ Role Based Access</div>

            <div>✅ Organization Portal</div>

            <div>🟡 Credential Issuance</div>

            <div>🟡 Verification Engine</div>

            <div>⚪ Blockchain Integration</div>

            <div>⚪ Public Credential Sharing</div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asChild>
            <a
              href="https://github.com/MrPiyush67/CredVerify-full"
              target="_blank"
            >
              View Source Code
            </a>
          </Button>

          <Button variant="outline" asChild>
            <a href="mailto:mrpiyush67642005@gmail.com">Contact Me</a>
          </Button>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Last updated • July 2026
        </p>
      </div>
    </main>
  );
}
