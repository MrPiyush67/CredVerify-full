import { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

function formatRelative(date) {
  if (!date) return 'Never';
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (days < 1) return 'Today';
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
}

/**
 * Note: two-factor auth, login alert preferences, and session metadata aren't
 * part of the current user schema. This tab manages them as local UI state —
 * wire up onChangePassword / onToggle2FA / onViewSessions to your auth API,
 * and consider adding a `security` sub-document to the schema if you want
 * these preferences persisted per user.
 *
 * @param {Object} props
 * @param {Object} props.user
 * @param {(passwords: {current: string, next: string}) => void} props.onChangePassword
 * @param {() => void} props.onViewSessions
 */
export function SecurityTab({ user, onChangePassword, onViewSessions }) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) return;
    onChangePassword?.({ current: passwords.current, next: passwords.next });
    setPasswords({ current: '', next: '', confirm: '' });
    setDialogOpen(false);
  };

  return (
    <TabsContent value="security">
      <Card>
        <CardHeader>
          <CardTitle>Security settings</CardTitle>
          <CardDescription>
            Manage your account security and authentication.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                Last changed{' '}
                {formatRelative(user?.passwordUpdatedAt ?? user?.updatedAt)}
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Change password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handlePasswordSubmit}>
                  <DialogHeader>
                    <DialogTitle>Change password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and choose a new one.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwords.current}
                        onChange={(e) =>
                          setPasswords((p) => ({
                            ...p,
                            current: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwords.next}
                        onChange={(e) =>
                          setPasswords((p) => ({ ...p, next: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Confirm new password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) =>
                          setPasswords((p) => ({
                            ...p,
                            confirm: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Update password</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-factor authentication</p>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  twoFactorEnabled
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-muted-foreground/20 text-muted-foreground'
                }
              >
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
              <Button
                variant="outline"
                onClick={() => setTwoFactorEnabled((v) => !v)}
              >
                Configure
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Login notifications</p>
              <p className="text-sm text-muted-foreground">
                Get notified when someone logs into your account
              </p>
            </div>
            <Switch
              checked={loginNotifications}
              onCheckedChange={setLoginNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Active sessions</p>
              <p className="text-sm text-muted-foreground">
                Manage devices that are logged into your account
              </p>
            </div>
            <Button variant="outline" onClick={onViewSessions}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              View sessions
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
