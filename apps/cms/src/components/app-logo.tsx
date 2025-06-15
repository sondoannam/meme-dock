import { cn } from '@/lib/utils';

interface AppLogoProps {
  size: 'sm' | 'md' | 'lg';
}

export const AppLogo = ({ size = 'md' }: AppLogoProps) => {
  const logoImgSizes = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-10 w-auto',
  };

  const logoTextSizes = {
    sm: '!text-sm font-medium',
    md: '!text-base font-medium',
    lg: '!text-lg font-semibold',
  };

  return (
    <div className={cn('flex items-center gap-2')}>
      <img
        src="/logos/meme-dock-brand-logo.png"
        alt="Meme Dock logo, brand symbol"
        className={logoImgSizes[size]}
      />
      <span className={logoTextSizes[size]}>
        <span className="text-brand-yellow-1">Meme</span>{' '}
        <span className="text-brand-orange">Dock</span> CMS
      </span>
    </div>
  );
};
