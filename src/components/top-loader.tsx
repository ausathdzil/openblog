import { cn } from '@/lib/utils';

export function TopLoader({ isPending }: { isPending: boolean }) {
  return (
    <div
      className={cn(
        'fixed top-0 right-0 left-0 z-50 h-0.5 origin-left bg-primary transition-transform duration-300 ease-out',
        isPending ? 'scale-x-100' : 'scale-x-0'
      )}
    />
  );
}
