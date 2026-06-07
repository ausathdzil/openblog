import { Muted, Title } from '@/components/typography';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="w-full max-w-xs space-y-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <Title className="text-2xl">Choose your username</Title>
        <Muted className="text-balance">You can change this at any time.</Muted>
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
