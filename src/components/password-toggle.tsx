import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { InputGroupButton } from './ui/input-group';

interface PasswordToggleProps
  extends React.ComponentProps<typeof InputGroupButton> {
  isVisible: boolean;
  onClick: () => void;
}

export function PasswordToggle({
  isVisible,
  onClick,
  ...props
}: PasswordToggleProps) {
  return (
    <InputGroupButton
      aria-label={isVisible ? 'Hide' : 'Show'}
      onClick={onClick}
      size="icon-xs"
      title={isVisible ? 'Hide' : 'Show'}
      type="button"
      variant="ghost"
      {...props}
    >
      {isVisible ? (
        <HugeiconsIcon icon={ViewIcon} strokeWidth={2} />
      ) : (
        <HugeiconsIcon icon={ViewOffSlashIcon} strokeWidth={2} />
      )}
    </InputGroupButton>
  );
}
