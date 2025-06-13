import { Icons } from '@/components/icons';
import { ModeToggle } from '@/components/mode-toggle';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <SidebarInset>
      <section className="w-full flex flex-col min-h-screen">
        <header className="w-full h-16 shrink-0 border-b sm:px-4 px-3">
          <div className="max-w-[1240px] h-full flex items-center gap-2 mx-auto">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 !h-4" />
            <ModeToggle />
            <Separator orientation="vertical" className="mr-2 !h-4" />
          </div>
        </header>
        <main className="w-full sm:px-4 px-3 flex-grow">
          <div className="max-w-[1240px] mx-auto">
            <Outlet />
          </div>
        </main>
        <footer className="w-full border-t py-6 sm:px-4 px-3 mt-auto">
          <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/logos/meme-dock-brand-logo.png"
                alt="Meme Dock logo, brand symbol"
                className="h-8 w-auto"
              />
              <span className="!text-sm font-medium">
                <span className='text-[#e9c46a]'>Meme</span> <span className='text-[#e76f51]'>Dock</span> CMS
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 !text-sm text-muted-foreground">
              <div className="flex items-center">
                <span>© {new Date().getFullYear()} Meme Dock</span>
              </div>
              <div>
                <span>
                  Created with ❤️ by{' '}
                  <a
                    href="https://github.com/sondoannam"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline-offset-4 hover:underline text-foreground"
                  >
                    sondoannam
                  </a>
                </span>
              </div>
              <div className="flex gap-4">
                <a
                  href="https://github.com/sondoannam/meme-dock"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  <Icons.Github className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </section>
    </SidebarInset>
  );
};

export default MainLayout;
