/** biome-ignore-all lint/performance/noImgElement: OG preview is blob URL, fixed 1200x630 via CSS; transient blob: cannot use next/image */
'use client';

import { useForm } from '@tanstack/react-form';
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

import { Muted } from '@/components/typography';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/toast';
import { updateArticle, uploadCoverImage } from '@/lib/article-actions';
import { cn } from '@/lib/utils';

const COVER_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];
const MAX_COVER_SIZE = 3 * 1024 * 1024;

const coverFormSchema = z.object({
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
  focusInput: () => void;
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
  const { refresh } = useRouter();
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initialCoverImage ?? null
  );
  const [coverStatus, setCoverStatus] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isCoverPending, startCoverTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const coverForm = useForm({
    defaultValues: { file: null as File | null },
    validators: { onSubmit: coverFormSchema },
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
          toast.add({ type: 'success', description: result.message });
          coverForm.reset();
          refresh();
        } else {
          setCoverStatus({
            type: 'error',
            message: result.message || 'Failed to upload cover image.',
          });
          toast.add({ type: 'error', description: result.message });
        }
      });
    },
    onSubmitInvalid() {
      const invalid = document.querySelector(
        '[aria-invalid="true"]'
      ) as HTMLElement | null;
      if (invalid) {
        invalid.focus();
      } else {
        inputRef.current?.focus();
      }
    },
  });

  useImperativeHandle(ref, () => ({
    hasPendingFile: () =>
      !!coverForm.getFieldValue('file') && !!coverPreview?.startsWith('blob:'),
    focusInput: () => inputRef.current?.focus(),
  }));

  useEffect(
    () => () => {
      if (coverPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreview);
      }
    },
    [coverPreview]
  );

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
    const parsed = coverFormSchema.shape.file.safeParse(selected);
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
      const { status, message } = await updateArticle(publicId, {
        coverImage: null,
      });
      if (status === 200) {
        if (coverPreview?.startsWith('blob:')) {
          URL.revokeObjectURL(coverPreview);
        }
        setCoverPreview(null);
        setCoverStatus({ type: 'success', message: 'Cover image removed.' });
        toast.add({ type: 'success', description: 'Cover image removed.' });
        coverForm.reset();
        refresh();
      } else {
        setCoverStatus({ type: 'error', message });
        toast.add({ type: 'error', description: message });
      }
    });
  };

  return (
    <div className="space-y-2">
      <Field>
        <FieldLabel htmlFor="cover-image">Cover image</FieldLabel>
        <div className="mx-auto aspect-1200/630 w-full max-w-150 overflow-hidden rounded-md border bg-muted">
          {coverPreview ? (
            <img
              alt={title ? `${title} cover image` : 'Cover image preview'}
              className="h-full w-full object-cover"
              height={630}
              src={coverPreview}
              width={1200}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-6 text-muted-foreground text-sm">
              No cover image — 1200×630 recommended
            </div>
          )}
        </div>
      </Field>
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          coverForm.handleSubmit();
        }}
      >
        <FieldGroup>
          <coverForm.Field name="file">
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
                    id="cover-image"
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
          </coverForm.Field>
          <Field>
            <div className="flex gap-2">
              <Button disabled={isCoverPending} type="submit" variant="outline">
                {isCoverPending ? <Spinner /> : null} Upload
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
    </div>
  );
}
