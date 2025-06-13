import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  helperText?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export const StatsCard = ({
  title,
  value,
  icon,
  helperText,
  onClick,
  isActive,
}: StatsCardProps) => {
  return (
    <Card
      className={cn(
        'cursor-pointer hover:shadow-md transition-all hover:border hover:border-primary',
        isActive ? 'ring-2 ring-primary' : '',
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
      </CardContent>
    </Card>
  );
};
