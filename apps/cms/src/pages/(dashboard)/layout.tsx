import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/layouts/app-sidebar';
import MainLayout from '@/layouts/main-layout';

export function Component() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <MainLayout />
      </div>
    </SidebarProvider>
  );
}
