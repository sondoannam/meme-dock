import { ModeToggle } from '@/components/mode-toggle';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <SidebarInset>
      <section className="w-full">
        <header className="w-full h-16 shrink-0 border-b sm:px-4 px-3">
          <div className="max-w-[1240px] h-full flex items-center gap-2 mx-auto">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 !h-4" />
            <ModeToggle />
            <Separator orientation="vertical" className="mr-2 !h-4" />
          </div>
        </header>
        <main className="w-full sm:px-4 px-3">
          <div className='max-w-[1240px] mx-auto'>
            <Outlet />
          </div>
        </main>
      </section>
    </SidebarInset>
  );
};

export default MainLayout;
