'use client';

import {
  ComputerIcon,
  Moon02Icon,
  Sun02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ModeToggle(props: React.ComponentProps<typeof Button>) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Toggle theme"
            size="icon-sm"
            title="Toggle theme"
            variant="ghost"
            {...props}
          />
        }
      >
        <HugeiconsIcon
          className="rotate-0 scale-100 dark:-rotate-90 dark:scale-0"
          icon={Sun02Icon}
          strokeWidth={2}
        />
        <HugeiconsIcon
          className="absolute rotate-90 scale-0 dark:rotate-0 dark:scale-100"
          icon={Moon02Icon}
          strokeWidth={2}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <HugeiconsIcon icon={Sun02Icon} strokeWidth={2} />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <HugeiconsIcon icon={Moon02Icon} strokeWidth={2} />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <HugeiconsIcon icon={ComputerIcon} strokeWidth={2} />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
