'use client';

import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';

export function SettingsHeader({ publicId }: { publicId: string }) {
  const { replace } = useRouter();
  return (
    <Header>
      <Header.Nav>
        <Button
          className="-ml-3"
          onClick={() => replace(`/editor/${publicId}`)}
          size="sm"
          variant="ghost"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} /> Back
        </Button>
      </Header.Nav>
    </Header>
  );
}
