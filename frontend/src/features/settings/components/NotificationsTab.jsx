import { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const DEFAULT_PREFERENCES = {
  email: true,
  push: false,
  marketing: true,
  weeklySummary: true,
};

/**
 * Notification preferences aren't part of the current user schema. This tab
 * manages them as local UI state — persist them by adding a
 * `notificationPreferences` sub-document to the User model, or a separate
 * collection, and wire `onChange` up to your save endpoint.
 *
 * @param {Object} props
 * @param {Object} [props.preferences] - initial preferences, defaults shown above
 * @param {(preferences: Object) => void} props.onChange
 */
export function NotificationsTab({ preferences = DEFAULT_PREFERENCES, onChange }) {
  const [prefs, setPrefs] = useState(preferences);

  const toggle = (key) => (checked) => {
    const next = { ...prefs, [key]: checked };
    setPrefs(next);
    onChange?.(next);
  };

  return (
    <TabsContent value="notifications">
      <Card>
        <CardHeader>
          <CardTitle>Notification preferences</CardTitle>
          <CardDescription>Choose what notifications you want to receive.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email notifications</p>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch checked={prefs.email} onCheckedChange={toggle('email')} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push notifications</p>
              <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
            </div>
            <Switch checked={prefs.push} onCheckedChange={toggle('push')} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Marketing emails</p>
              <p className="text-sm text-muted-foreground">Receive emails about new features and updates</p>
            </div>
            <Switch checked={prefs.marketing} onCheckedChange={toggle('marketing')} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly summary</p>
              <p className="text-sm text-muted-foreground">Get a weekly summary of your activity</p>
            </div>
            <Switch checked={prefs.weeklySummary} onCheckedChange={toggle('weeklySummary')} />
          </div>

          <Separator />

          <div className="flex items-center justify-between opacity-60">
            <div>
              <p className="font-medium">Security alerts</p>
              <p className="text-sm text-muted-foreground">Important security notifications (always enabled)</p>
            </div>
            <Switch checked disabled />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}