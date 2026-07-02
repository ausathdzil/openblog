'use client';

import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';

import { Header } from '@/components/header';
import { Large } from '@/components/typography';
import { Button } from '@/components/ui/button';

export function SettingsHeader({
  publicId,
  children,
}: {
  publicId: string;
  children?: React.ReactNode;
}) {
  const { replace } = useRouter();
  return (
    <Header>
      <Header.Nav>
        <Button
          className="gap-2"
          onClick={() => replace(`/editor/${publicId}`)}
          size="sm"
          variant="ghost"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} /> Back
        </Button>
      </Header.Nav>
      <Header.Center className="hidden sm:block">
        <Large>Article Settings</Large>
      </Header.Center>
      <Header.Actions>{children}</Header.Actions>
    </Header>
  );
}
