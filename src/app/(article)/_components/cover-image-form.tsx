// biome-ignore-all lint/suspicious/noUnnecessaryConditions: Ref is nullable until mounted
'use client';

import { ImageCropIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm, useSelector } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import {
  type ChangeEvent,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useTransition,
} from 'react';
import * as z from 'zod';

import { BeforeUnloadGuard } from '@/components/before-unload-guard';
import { CropDialog } from '@/components/crop-dialog';
import { Muted } from '@/components/typography';
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
import { removeCoverImage, uploadCoverImage } from '@/lib/article-actions';
import {
  ACCEPT_IMAGE_STRING,
  canBrowserDecodeImage,
  createImageFileSchema,
} from '@/lib/image-validation';
import { cn } from '@/lib/utils';

const MAX_COVER_SIZE = 3 * 1024 * 1024; // 3MB

const coverImageFormSchema = z.object({
  file: createImageFileSchema(
    MAX_COVER_SIZE,
    'Cover image',
    'Cover image must be less than 3MB.'
  ),
});

interface CropTarget {
  fileName: string;
  mimeType: string;
  src: string;
}

export interface CoverImageFormHandle {
  hasPendingFile: () => boolean;
}

export interface CoverImageFormProps {
  initialImage: string | null;
  publicId: string;
  ref?: React.Ref<CoverImageFormHandle>;
  title?: string;
}

export function CoverImageForm({
  initialImage,
  publicId,
  ref,
  title,
}: CoverImageFormProps) {
  const [formStatus, setFormStatus] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [preview, setPreview] = useState<string | null>(initialImage ?? null);
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);
  const [isUploading, startUploadTransition] = useTransition();
  const [isRemoving, startRemoveTransition] = useTransition();
  const isPending = isUploading || isRemoving;
  const inputRef = useRef<HTMLInputElement>(null);
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
      onSubmit: coverImageFormSchema,
    },
    onSubmit: ({ value }) => {
      setFormStatus(null);
      startUploadTransition(async () => {
        if (!value.file) {
          return;
        }
        const { status, message, url } = await uploadCoverImage(
          publicId,
          value.file
        );
        if (status === 200 && url) {
          setPreview(url);
          setFormStatus({
            type: 'success',
            message: message || 'Cover image updated.',
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
            message: message || 'Failed to upload cover image.',
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

  const file = useSelector(form.store, (state) => state.values.file);

  useImperativeHandle(ref, () => ({
    hasPendingFile: () => !!file && !!preview?.startsWith('blob:'),
  }));

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
    const parsed = coverImageFormSchema.shape.file.safeParse(selected);
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

  const handleCoverRemove = () => {
    setFormStatus(null);
    startRemoveTransition(async () => {
      const { status, message } = await removeCoverImage(publicId);
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
        aspect={1200 / 630}
        cropShape="rect"
        fileName={cropTarget?.fileName ?? 'cover.jpg'}
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
        title="Crop Cover Image"
      />
      <Card>
        <CardHeader>
          <CardTitle>Cover Image</CardTitle>
          <CardDescription>
            Upload a JPEG, PNG, or WebP image no larger than 3MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mx-auto mb-6 aspect-1200/630 w-full max-w-150 overflow-hidden rounded-md border bg-muted">
            {preview ? (
              <>
                {/* biome-ignore lint/performance/noImgElement: OG preview is blob URL, fixed 1200x630 via CSS; transient blob: cannot use next/image */}
                <img
                  alt={title ? `${title} cover image` : 'Cover image preview'}
                  className="h-full w-full object-cover"
                  height={630}
                  src={preview}
                  width={1200}
                />
                <Button
                  className="absolute right-3 bottom-3 gap-1.5 bg-background/85 shadow-xs backdrop-blur-xs hover:bg-background"
                  disabled={isPending}
                  onClick={() => {
                    if (preview) {
                      setFormStatus(null);
                      setCropTarget({
                        src: preview,
                        fileName: 'cover.jpg',
                        mimeType: 'image/jpeg',
                      });
                    }
                  }}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  <HugeiconsIcon icon={ImageCropIcon} strokeWidth={2} />
                  Adjust crop
                </Button>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center p-6 text-muted-foreground text-sm">
                Choose an image to see preview — 1200x630 recommended
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="file"
                validators={{ onChange: coverImageFormSchema.shape.file }}
              >
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel className="sr-only" htmlFor={field.name}>
                        Cover image
                      </FieldLabel>
                      <Input
                        accept={ACCEPT_IMAGE_STRING}
                        aria-invalid={isInvalid}
                        disabled={isPending}
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          handleFileChange(e, field.handleChange)
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
                      onClick={handleCoverRemove}
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
