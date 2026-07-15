import { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const ROLE_LABELS = {
  learner: 'Learner',
  issuer: 'Issuer',
  regulator: 'Regulator',
  organization_admin: 'Organization Admin',
};

/**
 * @param {Object} props
 * @param {Object} props.user
 * @param {(isPublic: boolean) => void} props.onVisibilityChange
 * @param {() => void} props.onExportData
 * @param {() => void} props.onDeleteAccount
 */
export function AccountTab({ user, onVisibilityChange, onExportData, onDeleteAccount }) {
  const [isPublic, setIsPublic] = useState(!!user?.isPublic);

  const handleVisibilityChange = (checked) => {
    setIsPublic(checked);
    onVisibilityChange?.(checked);
  };

  return (
    <TabsContent value="account" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account settings</CardTitle>
          <CardDescription>Manage your account status, role, and privacy.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Account status</p>
              <p className="text-sm text-muted-foreground">
                Your account is currently {user?.isActive ? 'active' : 'inactive'}
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                user?.isActive
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }
            >
              {user?.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Role</p>
              <p className="text-sm text-muted-foreground">
                {user?.organization ? 'Assigned to an organization' : 'No organization assigned'}
              </p>
            </div>
            <Badge variant="secondary">{ROLE_LABELS[user?.role] ?? user?.role}</Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Account visibility</p>
              <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
            </div>
            <Switch checked={isPublic} onCheckedChange={handleVisibilityChange} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Data export</p>
              <p className="text-sm text-muted-foreground">Download a copy of your data</p>
            </div>
            <Button variant="outline" onClick={onExportData}>
              <Download className="mr-2 h-4 w-4" />
              Export data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes your profile, credentials, and activity. This action can&apos;t be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDeleteAccount}>Delete account</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}