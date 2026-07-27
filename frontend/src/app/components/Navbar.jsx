import { Link } from 'react-router';
import {
  Bell,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Star,
  Sun,
  User,
  Video,
} from 'lucide-react';

import { useThemeStore } from '@/app/store/themeStore';
import { useGetMe, useLogout } from '@/features/auth/authHooks';

import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const { theme, setTheme } = useThemeStore();
  const { data: user } = useGetMe();
  const { mutateAsync: LogoutMutation } = useLogout();

  // TODO: Replace with dynamic page title
  const pageTitle = 'Discover';

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b bg-background px-4">
      {/* Left */}
      <div className="flex items-center gap-2">
        <SidebarTrigger />

        <Separator
          orientation="vertical"
          className="mr-2 h-4 data-[orientation=vertical]:self-center"
        />

        <h1 className="text-base font-semibold tracking-tight">{pageTitle}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="size-8">
              {theme === 'light' ? (
                <Sun className="size-4" />
              ) : theme === 'dark' ? (
                <Moon className="size-4" />
              ) : (
                <Monitor className="size-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={12}>
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <div>
                <Sun className="mr-1 h-4 w-4" />
              </div>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <div>
                <Moon className="mr-1 h-4 w-4" />
              </div>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <div>
                <Monitor className="mr-1 h-4 w-4" />
              </div>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="size-8">
              <Bell className="size-4" />
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={12} className="w-80">
            <DropdownMenuLabel className="flex justify-between items-center">
              <p>Notifications</p>
              <Button variant="ghost" size="xs" className="mb-0.5" asChild>
                <Link to="/notifications">View All</Link>
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex items-center gap-2">
                <Star className="size-4" />
                <span>Event Today</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex items-center gap-2">
                <Video className="size-4" />
                <span>Team Meeting</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator
          orientation="vertical"
          className="mr-1 ml-2 h-4 data-[orientation=vertical]:self-center"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 rounded-lg">
              <Avatar className="size-7">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.charAt(0) ?? 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" sideOffset={12} className="w-46">
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>
                    {user?.name?.charAt(0) ?? 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <span className="font-medium">{user?.name}</span>

                  <span className="text-xs text-muted-foreground">
                    {user?.role}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <User className="size-4" />
                  Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings className="size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to="/notifications">
                  <Bell className="size-4" />
                  Notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => LogoutMutation()}
              asChild
            >
              <Link>
                <LogOut className="size-4" />
                Log out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
