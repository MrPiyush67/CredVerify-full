import { useState } from 'react';
import { Upload, FileText, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { useGetOrgs } from '../addCredentialHooks.js';

export default function OrganizationVerificationModal({
  isOpen,
  onClose,
  onSubmit,
}) {
  const { data: orgs, isPending } = useGetOrgs(); // orgs is an array of objects with _id, name, logo, type
  const [companyName, setCompanyName] = useState('');
  const [certificateFile, setCertificateFile] = useState(null);
  const [courseUrl, setCourseUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        certificateFile: 'Only PDF, JPEG, PNG files are allowed',
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        certificateFile: 'File size must be less than 5MB',
      }));
      return;
    }

    setCertificateFile(file);
    setErrors((prev) => ({ ...prev, certificateFile: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!companyName) newErrors.companyName = 'Please select an organization';
    if (!certificateFile)
      newErrors.certificateFile = 'Please upload a certificate';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulateVerify = () =>
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            verified: true,
            matchScore: 0.94,
            credential: {
              _id: `demo-${Date.now()}`,
              title: certificateFile.name,
              issuer: companyName,
              verificationStatus: 'VERIFIED',
              createdAt: new Date().toISOString(),
            },
          }),
        1400,
      ),
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await simulateVerify();
      onSubmit?.({
        ...result,
        uploadMethod: 'Organization Verification',
        companyName,
        courseUrl,
      });
      handleClose();
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: 'Failed to verify certificate',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCompanyName('');
    setCertificateFile(null);
    setCourseUrl('');
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (isPending) return null;
  // console.log(orgs);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Organization Verification</DialogTitle>
          <DialogDescription>
            Verify certificates from registered organizations
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <Alert variant="destructive">
              <AlertTitle>Verification error</AlertTitle>
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertTitle>How organization verification works</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                <li>Select the organization that issued your certificate</li>
                <li>Upload your certificate image or PDF</li>
                <li>
                  We'll verify it against our organization database using OCR
                  and matching
                </li>
                <li>
                  Verified certificates are automatically added to your
                  portfolio
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="companyName" className="mb-2 block">
              Organization <span className="text-destructive">*</span>
            </Label>
            <Select
              value={companyName}
              onValueChange={setCompanyName}
              disabled={isSubmitting}
              modal={false}
            >
              <SelectTrigger
                id="companyName"
                className={errors.companyName ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="Select an organization" />
              </SelectTrigger>
              <SelectContent>
                {orgs?.map((org) => (
                  <SelectItem key={org?._id} value={org?.name}>
                    {org?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.companyName && (
              <p className="mt-1 text-sm text-destructive">
                {errors.companyName}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="certificateFile" className="mb-2 block">
              Certificate Document <span className="text-destructive">*</span>
            </Label>
            <input
              type="file"
              id="certificateFile"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
              disabled={isSubmitting}
            />
            <label
              htmlFor="certificateFile"
              className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                errors.certificateFile
                  ? 'border-destructive bg-destructive/5'
                  : 'hover:border-primary'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-center">
                {certificateFile ? (
                  <>
                    <FileText className="mx-auto h-12 w-12 text-primary" />
                    <p className="mt-2 text-sm font-medium">
                      {certificateFile.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Click to change file
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-primary">
                        Click to upload
                      </span>{' '}
                      or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PDF, PNG, JPEG (max 5MB)
                    </p>
                  </>
                )}
              </div>
            </label>
            {errors.certificateFile && (
              <p className="mt-1 text-sm text-destructive">
                {errors.certificateFile}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="courseUrl" className="mb-2 block">
              Course Link (Optional)
            </Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="courseUrl"
                type="url"
                placeholder="https://example.com/course/..."
                value={courseUrl}
                onChange={(e) => setCourseUrl(e.target.value)}
                className="pl-10"
                disabled={isSubmitting}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Add course URL for NCrF/NSQF level analysis (from Coursera, NPTEL,
              etc.)
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Certificate'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
