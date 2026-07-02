import { OpenBlogButton } from '@/components/openblog-button';

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <main className="flex min-h-svh flex-col gap-4 p-6 md:p-10">
      <div className="flex justify-center gap-2">
        <OpenBlogButton />
      </div>
      <div className="flex flex-1 items-center justify-center">{children}</div>
    </main>
  );
}
