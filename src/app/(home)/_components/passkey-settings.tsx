'use client';

import { getAuthenticatorName } from '@better-auth/passkey';
import { Delete01Icon, Key01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/toast';
import { authClient } from '@/lib/auth-client';

interface UserPasskey {
  aaguid?: string | null;
  createdAt: Date;
  id: string;
  name?: string | null;
}

interface PasskeySettingsProps {
  initialPasskeys: UserPasskey[];
}

export function PasskeySettings({ initialPasskeys }: PasskeySettingsProps) {
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();

  const handleAddPasskey = () => {
    startTransition(async () => {
      const { error } = await authClient.passkey.addPasskey();

      if (error) {
        toast.add({
          type: 'error',
          description:
            error.message || 'Failed to add passkey. Please try again.',
        });
      } else {
        toast.add({ type: 'success', description: 'Passkey added.' });
        refresh();
      }
    });
  };

  const handleDeletePasskey = (id: string) => {
    startTransition(async () => {
      const { error } = await authClient.passkey.deletePasskey({ id });

      if (error) {
        toast.add({
          type: 'error',
          description:
            error.message || 'Failed to delete passkey. Please try again.',
        });
      } else {
        toast.add({ description: 'Passkey deleted.' });
        refresh();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passkeys</CardTitle>
        <CardDescription>
          Add a passkey to use biometrics or a security key for a faster,
          passwordless sign in experience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {initialPasskeys.length > 0 ? (
          <div className="space-y-3">
            {initialPasskeys.map((pk) => (
              <div
                className="flex items-center justify-between rounded-md border p-3"
                key={pk.id}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-sm">
                    {pk.name ||
                      (pk.aaguid && getAuthenticatorName(pk.aaguid)) ||
                      'Passkey'}
                  </span>
                  <span
                    className="text-muted-foreground text-xs"
                    suppressHydrationWarning
                  >
                    Added {new Date(pk.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        aria-label={`Delete ${pk.name || 'passkey'}`}
                        size="icon"
                        title={`Delete ${pk.name || 'passkey'}`}
                        variant="destructive"
                      />
                    }
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={18} />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete passkey?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove the passkey from your
                        account. You won't be able to use it to sign in anymore.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={isPending}
                        onClick={() => handleDeletePasskey(pk.id)}
                        variant="destructive"
                      >
                        {isPending ? (
                          <Spinner />
                        ) : (
                          <HugeiconsIcon icon={Delete01Icon} size={18} />
                        )}
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No passkeys added yet.
          </p>
        )}
      </CardContent>
      <CardFooter className="border-t">
        <Button
          disabled={isPending}
          onClick={handleAddPasskey}
          variant="secondary"
        >
          {isPending ? (
            <Spinner />
          ) : (
            <HugeiconsIcon icon={Key01Icon} strokeWidth={2} />
          )}
          Add Passkey
        </Button>
      </CardFooter>
    </Card>
  );
}
