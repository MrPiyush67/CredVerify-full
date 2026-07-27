import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Calendar,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Hash,
  MoreVertical,
  ShieldCheck,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';

import { Card, CardContent } from '@/components/ui/card';

import { Separator } from '@/components/ui/separator';

const credential = {
  title: 'React Developer Certification',
  issuer: 'Meta',

  image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200',

  description:
    'This certification validates professional React development skills including component architecture, hooks, routing, performance optimization and production deployment.',

  issueDate: '12 Jun 2026',
  expiryDate: 'Never',

  credentialId: 'META-REACT-849213',

  verificationStatus: 'Verified',

  organizationVerified: true,

  verificationMethod: 'Organization Verification',

  skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Vite'],

  files: [
    {
      name: 'Certificate.pdf',
      size: '1.4 MB',
    },
  ],
};

export default function ViewCredentialDetailsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Copy className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon">
            <ExternalLink className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hero */}

      <div className="grid gap-8 lg:grid-cols-[480px_1fr]">
        {/* Preview */}

        <Card className="overflow-hidden p-0">
          <img
            src={credential.image}
            alt={credential.title}
            className="aspect-[4/3] w-full object-cover"
          />
        </Card>

        {/* Information */}

        <div className="flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-3">
              <Badge className="gap-2">
                <BadgeCheck className="h-3.5 w-3.5" />

                {credential.verificationStatus}
              </Badge>

              <h1 className="text-3xl font-bold tracking-tight">
                {credential.title}
              </h1>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />

                {credential.issuer}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {credential.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="grid grid-cols-2 gap-6 p-6">
              <div>
                <p className="mb-1 text-xs uppercase text-muted-foreground">
                  Issue Date
                </p>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />

                  {credential.issueDate}
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs uppercase text-muted-foreground">
                  Expiry
                </p>

                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />

                  {credential.expiryDate}
                </div>
              </div>

              <div className="col-span-2">
                <p className="mb-1 text-xs uppercase text-muted-foreground">
                  Credential ID
                </p>

                <div className="flex items-center gap-2 font-medium">
                  <Hash className="h-4 w-4" />

                  {credential.credentialId}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Description */}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Description</h2>

        <p className="leading-7 text-muted-foreground">
          {credential.description}
        </p>
      </section>

      <Separator />

      {/* Verification */}

      <section className="space-y-5">
        <h2 className="text-xl font-semibold">Verification Information</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="flex items-start gap-4 p-5">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />

              <div>
                <p className="text-sm text-muted-foreground">
                  Verification Method
                </p>

                <p className="font-medium">{credential.verificationMethod}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-4 p-5">
              <Globe className="mt-0.5 h-5 w-5 text-primary" />

              <div>
                <p className="text-sm text-muted-foreground">
                  Organization Verification
                </p>

                <p className="font-medium">
                  {credential.organizationVerified
                    ? 'Verified'
                    : 'Not Verified'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Files */}

      <section className="space-y-5">
        <h2 className="text-xl font-semibold">Attached Files</h2>

        <div className="space-y-3">
          {credential.files.map((file) => (
            <Card key={file.name}>
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <p className="font-medium">{file.name}</p>

                    <p className="text-sm text-muted-foreground">{file.size}</p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Related Credentials */}

      <section className="space-y-5">
        <h2 className="text-xl font-semibold">Related Credentials</h2>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Card
              key={item}
              className="overflow-hidden transition-shadow hover:shadow-md"
            >
              <img
                src={credential.image}
                alt=""
                className="aspect-video w-full object-cover"
              />

              <CardContent className="space-y-4 p-5">
                <div>
                  <h3 className="line-clamp-2 font-semibold">
                    React Advanced Concepts
                  </h3>

                  <p className="text-sm text-muted-foreground">Meta</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">React</Badge>

                  <Badge variant="secondary">Hooks</Badge>

                  <Badge variant="secondary">TypeScript</Badge>
                </div>

                <Button variant="outline" className="w-full">
                  View Credential
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
