import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Spinner className="m-auto" />
    </div>
  );
}
