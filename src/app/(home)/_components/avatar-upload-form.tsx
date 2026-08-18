'use client';

import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import {
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import * as z from 'zod';

import { CropDialog } from '@/components/crop-dialog';
import { Muted } from '@/components/typography';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { removeAvatar, updateAvatar } from '../_lib/actions';

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const avatarFormSchema = z.object({
  file: z
    .file('Please select a file.')
    .check(
      z.minSize(1),
      z.maxSize(MAX_AVATAR_SIZE, 'Image must be less than 2MB.'),
      z.mime(AVATAR_TYPES, 'Image must be a JPEG, PNG, or WebP.')
    ),
});

interface AvatarUploadFormProps {
  initialImage?: string | null;
  name: string;
}

export function AvatarUploadForm({
  initialImage,
  name,
}: AvatarUploadFormProps) {
  const [formStatus, setFormStatus] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [preview, setPreview] = useState<string | null>(initialImage ?? null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [pendingFileName, setPendingFileName] = useState('avatar.webp');
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { refresh } = useRouter();

  useEffect(
    () => () => {
      if (preview?.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    },
    [preview]
  );

  useEffect(
    () => () => {
      if (rawImageSrc?.startsWith('blob:')) {
        URL.revokeObjectURL(rawImageSrc);
      }
    },
    [rawImageSrc]
  );

  const form = useForm({
    defaultValues: {
      file: null as File | null,
    },
    validators: {
      onSubmit: avatarFormSchema,
    },
    onSubmit: ({ value }) => {
      setFormStatus(null);
      startTransition(async () => {
        if (!value.file) {
          return;
        }
        const { status, message, url } = await updateAvatar(value.file);
        if (status === 200 && url) {
          setPreview(url);
          setFormStatus({
            type: 'success',
            message: message || 'Avatar updated.',
          });
          form.reset();
          // biome-ignore lint/suspicious/noUnnecessaryConditions: ref is nullable until mounted
          if (inputRef.current) {
            inputRef.current.value = '';
          }
          refresh();
        } else {
          setFormStatus({
            type: 'error',
            message: message || 'Failed to upload avatar.',
          });
        }
      });
    },
    onSubmitInvalid() {
      const $invalidInput = document.querySelector('[aria-invalid="true"]');

      if ($invalidInput instanceof HTMLElement) {
        $invalidInput.focus();
      }
    },
  });

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    onChange: (value: File | null) => void
  ) => {
    setFormStatus(null);
    const selected = event.target.files?.[0] ?? null;
    if (!selected) {
      onChange(null);
      return;
    }
    const parsed = avatarFormSchema.shape.file.safeParse(selected);
    if (!parsed.success) {
      onChange(selected);
      return;
    }
    if (rawImageSrc?.startsWith('blob:')) {
      URL.revokeObjectURL(rawImageSrc);
    }
    setRawImageSrc(URL.createObjectURL(selected));
    setPendingFileName(selected.name);
    setIsCropOpen(true);
  };

  const handleCropConfirm = (croppedFile: File) => {
    if (rawImageSrc?.startsWith('blob:')) {
      URL.revokeObjectURL(rawImageSrc);
    }
    setRawImageSrc(null);
    setIsCropOpen(false);
    setPreview(URL.createObjectURL(croppedFile));
    form.setFieldValue('file', croppedFile);
  };

  const handleCropCancel = () => {
    // biome-ignore lint/suspicious/noUnnecessaryConditions: ref is nullable until mounted
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (rawImageSrc?.startsWith('blob:')) {
      URL.revokeObjectURL(rawImageSrc);
    }
    setRawImageSrc(null);
    setIsCropOpen(false);
  };

  const handleAvatarRemove = () => {
    setFormStatus(null);
    startTransition(async () => {
      const { status, message } = await removeAvatar();
      if (status === 200) {
        setPreview(null);
        form.reset();
        // biome-ignore lint/suspicious/noUnnecessaryConditions: ref is nullable until mounted
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        setFormStatus({ type: 'success', message });
        refresh();
      } else {
        setFormStatus({ type: 'error', message });
      }
    });
  };

  return (
    <>
      <CropDialog
        aspect={1}
        cropShape="round"
        fileName={pendingFileName}
        imageSrc={rawImageSrc}
        onCancel={handleCropCancel}
        onCropConfirm={handleCropConfirm}
        onOpenChange={setIsCropOpen}
        open={isCropOpen}
      >
        <CropDialog.Content>
          <CropDialog.Header>
            <CropDialog.Title>Crop Profile Picture</CropDialog.Title>
            <CropDialog.Description>
              Drag to reposition and adjust zoom to crop your image.
            </CropDialog.Description>
          </CropDialog.Header>
          <CropDialog.Cropper />
          <CropDialog.Zoom />
          <CropDialog.Footer>
            <CropDialog.Close
              render={<Button variant="outline">Cancel</Button>}
            />
            <CropDialog.Apply />
          </CropDialog.Footer>
        </CropDialog.Content>
      </CropDialog>
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Upload a JPEG, PNG, or WebP image no larger than 2MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Avatar className="mx-auto mb-6 size-32">
            {preview ? <AvatarImage alt={name} src={preview} /> : null}
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <form
            className="flex flex-col gap-6"
            onSubmit={(event) => {
              event.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="file"
                validators={{ onChange: avatarFormSchema.shape.file }}
              >
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel className="sr-only" htmlFor={field.name}>
                        Profile Picture
                      </FieldLabel>
                      <Input
                        accept={AVATAR_TYPES.join(',')}
                        aria-invalid={isInvalid}
                        disabled={isPending}
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          handleFileChange(event, field.handleChange)
                        }
                        ref={inputRef}
                        required
                        type="file"
                      />
                      {!!isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
              <Field>
                <div className="flex gap-2">
                  <Button disabled={isPending} type="submit">
                    {!!isPending && <Spinner />}
                    Save Changes
                  </Button>
                  {preview ? (
                    <Button
                      disabled={isPending}
                      onClick={handleAvatarRemove}
                      type="button"
                      variant="ghost"
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
                <Muted
                  className={cn(
                    formStatus ? 'visible' : 'invisible',
                    formStatus?.type === 'error'
                      ? 'text-destructive'
                      : 'text-emerald-600 dark:text-emerald-500'
                  )}
                >
                  {formStatus?.message || ' '}
                </Muted>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
