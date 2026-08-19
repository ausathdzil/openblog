// biome-ignore-all lint/suspicious/noUnnecessaryConditions: Ref is nullable until mounted
'use client';

import { ImageCropIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
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

import { BeforeUnloadGuard } from '@/components/before-unload-guard';
import { CropDialog } from '@/components/crop-dialog';
import { Muted } from '@/components/typography';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  ACCEPT_IMAGE_STRING,
  canBrowserDecodeImage,
  createImageFileSchema,
} from '@/lib/image-validation';
import { cn } from '@/lib/utils';
import { removeAvatar, updateAvatar } from '../_lib/actions';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

const avatarFormSchema = z.object({
  file: createImageFileSchema(
    MAX_AVATAR_SIZE,
    'Avatar image',
    'Image must be less than 2MB.'
  ),
});

interface AvatarUploadFormProps {
  initialImage?: string | null;
  name: string;
}

interface CropTarget {
  fileName: string;
  mimeType: string;
  src: string;
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
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);
  const [isUploading, startUploadTransition] = useTransition();
  const [isRemoving, startRemoveTransition] = useTransition();
  const isPending = isUploading || isRemoving;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { refresh } = useRouter();

  useEffect(
    () => () => {
      if (preview?.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
      if (cropTarget?.src.startsWith('blob:')) {
        URL.revokeObjectURL(cropTarget.src);
      }
    },
    [preview, cropTarget]
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
      startUploadTransition(async () => {
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
          if (cropTarget?.src.startsWith('blob:')) {
            URL.revokeObjectURL(cropTarget.src);
          }
          setCropTarget(null);
          form.reset();
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

  const handleFileChange = async (
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
    const canDecode = await canBrowserDecodeImage(selected);
    if (!canDecode) {
      onChange(selected);
      setFormStatus({
        type: 'error',
        message:
          'This image cannot be decoded by your browser. Please select a valid JPEG, PNG, or WebP image.',
      });
      return;
    }
    if (cropTarget?.src.startsWith('blob:')) {
      URL.revokeObjectURL(cropTarget.src);
    }
    setCropTarget({
      src: URL.createObjectURL(selected),
      fileName: selected.name,
      mimeType: selected.type || 'image/jpeg',
    });
  };

  const handleCropConfirm = (croppedFile: File) => {
    if (cropTarget?.src.startsWith('blob:')) {
      URL.revokeObjectURL(cropTarget.src);
    }
    setCropTarget(null);
    setPreview((prev) => {
      if (prev?.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return URL.createObjectURL(croppedFile);
    });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(croppedFile);
    if (inputRef.current) {
      inputRef.current.files = dataTransfer.files;
    }
    form.setFieldValue('file', croppedFile);
  };

  const handleCropCancel = () => {
    if (!form.getFieldValue('file')) {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      if (cropTarget?.src.startsWith('blob:')) {
        URL.revokeObjectURL(cropTarget.src);
      }
    }
    setCropTarget(null);
  };

  const handleAvatarRemove = () => {
    setFormStatus(null);
    startRemoveTransition(async () => {
      const { status, message } = await removeAvatar();
      if (status === 200) {
        if (cropTarget?.src.startsWith('blob:')) {
          URL.revokeObjectURL(cropTarget.src);
        }
        setCropTarget(null);
        setPreview(null);
        form.reset();
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

  const isStaged = preview?.startsWith('blob:');

  return (
    <>
      <BeforeUnloadGuard isDirty={Boolean(isStaged)} />
      <CropDialog
        aspect={1}
        cropShape="round"
        fileName={cropTarget?.fileName ?? 'avatar.jpg'}
        imageSrc={cropTarget?.src ?? null}
        mimeType={cropTarget?.mimeType ?? 'image/jpeg'}
        onCancel={handleCropCancel}
        onCropConfirm={handleCropConfirm}
        onOpenChange={(open) => {
          if (!open) {
            handleCropCancel();
          }
        }}
        open={Boolean(cropTarget)}
        title="Crop Profile Picture"
      />
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Upload a JPEG, PNG, or WebP image no larger than 2MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mx-auto mb-6 size-32">
            <Avatar className="size-full">
              {preview ? (
                /* biome-ignore lint/performance/noImgElement: avatar preview can be transient blob: URL */
                <img
                  alt={name}
                  className="aspect-square size-full rounded-full object-cover"
                  height={128}
                  src={preview}
                  width={128}
                />
              ) : (
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            {preview ? (
              <Button
                aria-label="Adjust crop"
                className="absolute right-0 bottom-0 size-8 rounded-full shadow-xs"
                disabled={isPending}
                onClick={() => {
                  if (preview) {
                    setFormStatus(null);
                    setCropTarget({
                      src: preview,
                      fileName: 'avatar.jpg',
                      mimeType: 'image/jpeg',
                    });
                  }
                }}
                size="icon-sm"
                title="Adjust crop"
                type="button"
                variant="secondary"
              >
                <HugeiconsIcon icon={ImageCropIcon} strokeWidth={2} />
              </Button>
            ) : null}
          </div>
          <form
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
                        accept={ACCEPT_IMAGE_STRING}
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
                      <FieldDescription>
                        Upload to save your changes after selecting a file or
                        adjusting the crop.
                      </FieldDescription>
                      {!!isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
              <Field>
                <div className="flex gap-2">
                  <Button disabled={isPending} type="submit" variant="outline">
                    {!!isUploading && <Spinner />}
                    Upload
                  </Button>
                  {preview ? (
                    <Button
                      disabled={isPending}
                      onClick={handleAvatarRemove}
                      type="button"
                      variant="destructive"
                    >
                      {!!isRemoving && <Spinner />}
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
