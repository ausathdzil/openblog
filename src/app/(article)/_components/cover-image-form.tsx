// biome-ignore-all lint/suspicious/noUnnecessaryConditions: Ref is nullable until mounted
'use client';

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
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { removeCoverImage, uploadCoverImage } from '@/lib/article-actions';
import { cn } from '@/lib/utils';

const COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_COVER_SIZE = 3 * 1024 * 1024;

const coverImageFormSchema = z.object({
  file: z
    .file('Please select a file.')
    .check(
      z.minSize(1),
      z.maxSize(MAX_COVER_SIZE, 'Cover image must be less than 3MB.'),
      z.mime(COVER_TYPES, 'Cover image must be a JPEG, PNG, or WebP.')
    ),
});

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
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [pendingFileName, setPendingFileName] = useState('cover.webp');
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
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
      onSubmit: coverImageFormSchema,
    },
    onSubmit: ({ value }) => {
      setFormStatus(null);
      startTransition(async () => {
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
    const parsed = coverImageFormSchema.shape.file.safeParse(selected);
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
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (rawImageSrc?.startsWith('blob:')) {
      URL.revokeObjectURL(rawImageSrc);
    }
    setRawImageSrc(null);
    setIsCropOpen(false);
  };

  const handleCoverRemove = () => {
    setFormStatus(null);
    startTransition(async () => {
      const { status, message } = await removeCoverImage(publicId);
      if (status === 200) {
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

  return (
    <>
      <CropDialog
        aspect={1200 / 630}
        cropShape="rect"
        fileName={pendingFileName}
        imageSrc={rawImageSrc}
        onCancel={handleCropCancel}
        onCropConfirm={handleCropConfirm}
        onOpenChange={setIsCropOpen}
        open={isCropOpen}
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
          <div className="mx-auto mb-6 aspect-1200/630 w-full max-w-150 overflow-hidden rounded-md border bg-muted">
            {preview ? (
              // biome-ignore lint/performance/noImgElement: OG preview is blob URL, fixed 1200x630 via CSS; transient blob: cannot use next/image
              <img
                alt={title ? `${title} cover image` : 'Cover image preview'}
                className="h-full w-full object-cover"
                height={630}
                src={preview}
                width={1200}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-6 text-muted-foreground text-sm">
                Choose an image to see preview — 1200x630 recommended
              </div>
            )}
          </div>
          <form
            className="flex flex-col gap-6"
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
                        accept={COVER_TYPES.join(',')}
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
                    Upload
                  </Button>
                  {preview ? (
                    <Button
                      disabled={isPending}
                      onClick={handleCoverRemove}
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
