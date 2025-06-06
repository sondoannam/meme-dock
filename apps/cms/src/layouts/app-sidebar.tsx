import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LayoutDashboardIcon, ImageIcon, UsersIcon, SettingsIcon, LogOutIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboardIcon, path: '/dashboard' },
  { name: 'Media', icon: ImageIcon, path: '/media' },
  { name: 'Users', icon: UsersIcon, path: '/users' },
  { name: 'Settings', icon: SettingsIcon, path: '/settings' },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-4 py-3">
          <h2 className="text-lg font-semibold">Meme Dock</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {' '}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.name}
                    className={cn(
                      'py-3 h-auto',
                      location.pathname.includes(item.path) && 'bg-sidebar-accent',
                    )}
                    onClick={() => navigate(item.path)}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {item.name}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>{' '}
      <SidebarFooter>
        <SidebarSeparator />{' '}
        <Button
          variant="outline"
          className="w-full justify-start z-10 relative hover:!bg-destructive transition-colors dark:hover:text-white !py-3 h-auto"
          onClick={() => {
            console.log('Logout clicked');
            // Add your actual logout logic here
            // For example: authService.logout();
            alert('Logout functionality will be implemented here');
          }}
          type="button"
        >
          <LogOutIcon className="mr-2 size-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
