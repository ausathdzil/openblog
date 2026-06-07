import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="w-full max-w-xs space-y-6">
      <Spinner className="mx-auto" />
    </div>
  );
}
