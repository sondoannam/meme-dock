import { useLocation, useNavigate } from 'react-router-dom';
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
import {
  LayoutDashboardIcon,
  ImageIcon,
  UsersIcon,
  SettingsIcon,
  LogOutIcon,
  PencilRulerIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTE_PATH } from '@/constants/routes';
import { toast } from 'sonner';
import { useRequest } from 'ahooks';
import { authService } from '@/services/auth';

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboardIcon, path: ROUTE_PATH.DASHBOARD },
  { name: 'Memes', icon: ImageIcon, path: ROUTE_PATH.MEMES },
  { name: 'Meme Relations', icon: PencilRulerIcon, path: ROUTE_PATH.RELATIONS },
  { name: 'Users', icon: UsersIcon, path: ROUTE_PATH.USERS },
  { name: 'Settings', icon: SettingsIcon, path: ROUTE_PATH.SETTINGS },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { run: onClickLogout, loading } = useRequest(authService.logout, {
    manual: true,
    onSuccess: () => {
      toast.success('Logout successful');
      navigate(ROUTE_PATH.LOGIN);
    },
    onError: (error) => {
      console.error('Logout error:', error);
      toast.error(`Logout failed: ${error.message}`);
    },
  });

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-4 py-3">
          <h2 className="text-lg font-semibold">Meme Dock</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
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
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <Button
          variant="outline"
          className="w-full justify-start z-10 relative hover:!bg-destructive transition-colors dark:hover:text-white !py-3 h-auto"
          onClick={onClickLogout}
          type="button"
          disabled={loading}
          loading={loading}
        >
          {!loading && <LogOutIcon className="mr-2 size-4" /> }
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
