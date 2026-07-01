'use client';

import { useRouter } from 'next/navigation';

import { Header } from './header';

export function SettingsHeader({
  publicId,
  children,
}: {
  publicId: string;
  children?: React.ReactNode;
}) {
  const { replace } = useRouter();
  return (
    <Header
      onBackClick={() => replace(`/editor/${publicId}`)}
      title="Article Settings"
    >
      {children}
    </Header>
  );
}
