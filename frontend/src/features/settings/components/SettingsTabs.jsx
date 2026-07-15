import { TabsList, TabsTrigger } from '@/components/ui/tabs';

// Rendered inside the shared <Tabs> root from settings-page.jsx.
// Kept as its own component so the nav can be restyled independent of content.
export function SettingsTabs() {
  return (
    <TabsList className="grid w-full grid-cols-4 bg-muted">
      <TabsTrigger value="personal">Personal</TabsTrigger>
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="security">Security</TabsTrigger>
      <TabsTrigger value="notifications">Notifications</TabsTrigger>
    </TabsList>
  );
}
