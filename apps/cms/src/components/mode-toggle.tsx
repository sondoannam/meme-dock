import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { useEffect, useState } from 'react';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="icon">
        <div className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative overflow-hidden"
    >
      <Sun
        className="h-[1.2rem] w-[1.2rem] absolute transform transition-all duration-500 ease-in-out 
        origin-center
        dark:scale-0 dark:rotate-[-180deg] dark:opacity-0
        scale-100 rotate-0 opacity-100"
      />
      <Moon
        className="h-[1.2rem] w-[1.2rem] absolute transform transition-all duration-500 ease-in-out 
        origin-center
        dark:scale-100 dark:rotate-0 dark:opacity-100
        scale-0 rotate-[180deg] opacity-0"
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
