import { ModeToggle } from '@/components/mode-toggle';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  const { open } = useSidebar();

  return (
    <SidebarInset>
      <header
        className={cn(
          'w-full max-w-[1240px] flex h-16 shrink-0 items-center gap-2 border-b xl:px-4 3xl:px-6',
          open && 'mx-auto',
        )}
      >
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 !h-4" />
        <ModeToggle />
        <Separator orientation="vertical" className="mr-2 !h-4" />
      </header>
      <main className={cn('w-full max-w-[1240px] xl:px-4 3xl:p-6', open && 'mx-auto')}>
        <Outlet />
      </main>
    </SidebarInset>
  );
};

export default MainLayout;
