// biome-ignore-all lint/suspicious/noUnnecessaryConditions: inputRef is nullable until mounted
'use client';

import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import {
  type ChangeEvent,
  useImperativeHandle,
  useRef,
  useState,
  useTransition,
} from 'react';
import * as z from 'zod';

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

const COVER_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];
const MAX_COVER_SIZE = 3 * 1024 * 1024;

const coverImageFormSchema = z.object({
  file: z
    .file('Please select a file.')
    .check(
      z.minSize(1),
      z.maxSize(MAX_COVER_SIZE, 'Cover image must be less than 3MB.'),
      z.mime(
        COVER_TYPES,
        'Cover image must be a JPEG, PNG, WebP, GIF, or AVIF.'
      )
    ),
});

export interface CoverImageFormHandle {
  hasPendingFile: () => boolean;
}

export interface CoverImageFormProps {
  initialCoverImage: string | null;
  publicId: string;
  ref?: React.Ref<CoverImageFormHandle>;
  title?: string;
}

export function CoverImageForm({
  initialCoverImage,
  publicId,
  ref,
  title,
}: CoverImageFormProps) {
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initialCoverImage ?? null
  );
  const [coverStatus, setCoverStatus] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isCoverPending, startCoverTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const { refresh } = useRouter();

  const form = useForm({
    defaultValues: {
      file: null as File | null,
    },
    validators: {
      onSubmit: coverImageFormSchema,
    },
    onSubmit: ({ value }) => {
      setCoverStatus(null);
      startCoverTransition(async () => {
        if (!value.file) {
          return;
        }
        const result = await uploadCoverImage(publicId, value.file);
        if (result.status === 200 && result.url) {
          if (coverPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(coverPreview);
          }
          setCoverPreview(result.url);
          setCoverStatus({
            type: 'success',
            message: result.message || 'Cover image updated.',
          });
          form.reset();
          if (inputRef.current) {
            inputRef.current.value = '';
          }
          refresh();
        } else {
          setCoverStatus({
            type: 'error',
            message: result.message || 'Failed to upload cover image.',
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

  useImperativeHandle(ref, () => ({
    hasPendingFile: () => {
      const formFile = form.getFieldValue('file');
      const inputFile = inputRef.current?.files?.[0] ?? null;
      return !!(formFile || inputFile) && !!coverPreview?.startsWith('blob:');
    },
  }));

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    onChange: (v: File | null) => void
  ) => {
    const selected = event.target.files?.[0] ?? null;
    onChange(selected);
    setCoverStatus(null);
    if (!selected) {
      return;
    }
    const parsed = coverImageFormSchema.shape.file.safeParse(selected);
    if (!parsed.success) {
      return;
    }
    if (coverPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreview);
    }
    setCoverPreview(URL.createObjectURL(selected));
  };

  const handleCoverRemove = () => {
    setCoverStatus(null);
    startCoverTransition(async () => {
      const { status, message } = await removeCoverImage(publicId);
      if (status === 200) {
        if (coverPreview?.startsWith('blob:')) {
          URL.revokeObjectURL(coverPreview);
        }
        setCoverPreview(null);
        form.reset();
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        setCoverStatus({ type: 'success', message });
        refresh();
      } else {
        setCoverStatus({ type: 'error', message });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cover Image</CardTitle>
        <CardDescription>
          Upload a JPEG, PNG, WebP, GIF, or AVIF image no larger than 3MB.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mx-auto mb-6 aspect-1200/630 w-full max-w-150 overflow-hidden rounded-md border bg-muted">
          {coverPreview ? (
            // biome-ignore lint/performance/noImgElement: OG preview is blob URL, fixed 1200x630 via CSS; transient blob: cannot use next/image
            <img
              alt={title ? `${title} cover image` : 'Cover image preview'}
              className="h-full w-full object-cover"
              height={630}
              src={coverPreview}
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
            <form.Field name="file">
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
                      disabled={isCoverPending}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => handleFileChange(e, field.handleChange)}
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
                <Button
                  disabled={isCoverPending}
                  type="submit"
                  variant="outline"
                >
                  Upload
                </Button>
                {coverPreview ? (
                  <Button
                    disabled={isCoverPending}
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
                  coverStatus ? 'visible' : 'invisible',
                  coverStatus?.type === 'error'
                    ? 'text-destructive'
                    : 'text-emerald-600 dark:text-emerald-500'
                )}
              >
                {coverStatus?.message || ' '}
              </Muted>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
