'use client';

import {
  ComputerIcon,
  Moon02Icon,
  Sun02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTheme } from 'next-themes';

import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

export function UserModeToggle(
  props: React.ComponentProps<typeof DropdownMenuSub>,
) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenuSub {...props}>
      <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="min-w-32">
        <DropdownMenuItem
          closeOnClick={false}
          onClick={() => setTheme('light')}
        >
          Light
          <HugeiconsIcon className="ml-auto" icon={Sun02Icon} strokeWidth={2} />
        </DropdownMenuItem>
        <DropdownMenuItem closeOnClick={false} onClick={() => setTheme('dark')}>
          Dark
          <HugeiconsIcon
            className="ml-auto"
            icon={Moon02Icon}
            strokeWidth={2}
          />
        </DropdownMenuItem>
        <DropdownMenuItem
          closeOnClick={false}
          onClick={() => setTheme('system')}
        >
          System
          <HugeiconsIcon
            className="ml-auto"
            icon={ComputerIcon}
            strokeWidth={2}
          />
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
