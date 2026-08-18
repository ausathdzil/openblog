'use client';

import { useState } from 'react';
import Cropper from 'react-easy-crop';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Spinner } from '@/components/ui/spinner';

interface Area {
  height: number;
  width: number;
  x: number;
  y: number;
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  fileName = 'cropped.jpg',
  mimeType = 'image/jpeg',
  quality = 0.95
): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(pixelCrop.width));
  canvas.height = Math.max(1, Math.round(pixelCrop.height));
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const sourceX = Math.max(0, pixelCrop.x);
  const sourceY = Math.max(0, pixelCrop.y);
  const sourceWidth = Math.min(
    image.naturalWidth - sourceX,
    pixelCrop.width - (sourceX - pixelCrop.x)
  );
  const sourceHeight = Math.min(
    image.naturalHeight - sourceY,
    pixelCrop.height - (sourceY - pixelCrop.y)
  );
  const destX = Math.max(0, -pixelCrop.x);
  const destY = Math.max(0, -pixelCrop.y);

  if (sourceWidth > 0 && sourceHeight > 0) {
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      destX,
      destY,
      sourceWidth,
      sourceHeight
    );
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas export failed'));
          return;
        }
        resolve(
          new File([blob], fileName, {
            type: blob.type || mimeType,
          })
        );
      },
      mimeType,
      quality
    );
  });
}

interface CropDialogProps {
  aspect?: number;
  cropShape?: 'rect' | 'round';
  description?: string;
  fileName?: string;
  imageSrc: string | null;
  mimeType?: string;
  onCancel?: () => void;
  onCropConfirm: (croppedFile: File) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title?: string;
}

export function CropDialog({
  open,
  onOpenChange,
  imageSrc,
  title = 'Crop Image',
  description = 'Drag to reposition and adjust zoom to crop your image.',
  aspect = 1,
  cropShape = 'rect',
  fileName = 'cropped.jpg',
  mimeType = 'image/jpeg',
  onCropConfirm,
  onCancel,
}: CropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setError(null);
      onCancel?.();
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!(imageSrc && croppedAreaPixels)) {
      return;
    }
    setError(null);
    setIsProcessing(true);
    try {
      const croppedFile = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        fileName,
        mimeType
      );
      onCropConfirm(croppedFile);
      onOpenChange(false);
    } catch {
      setError('Failed to crop image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="data-open:zoom-in-100 data-closed:zoom-out-100 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="relative h-80 w-full overflow-hidden rounded-md bg-black">
          {imageSrc ? (
            <Cropper
              aspect={aspect}
              crop={crop}
              cropShape={cropShape}
              image={imageSrc}
              onCropChange={(nextCrop) => {
                if (error) {
                  setError(null);
                }
                setCrop(nextCrop);
              }}
              onCropComplete={(_croppedArea, newCroppedAreaPixels) => {
                setCroppedAreaPixels(newCroppedAreaPixels);
              }}
              onZoomChange={(nextZoom) => {
                if (error) {
                  setError(null);
                }
                setZoom(nextZoom);
              }}
              restrictPosition={true}
              showGrid={cropShape === 'rect'}
              zoom={zoom}
            />
          ) : null}
        </div>

        <div className="grid w-full gap-3">
          <Label htmlFor="crop-zoom">Zoom</Label>
          <Slider
            id="crop-zoom"
            max={3}
            min={1}
            onValueChange={(val) => {
              const next = Array.isArray(val) ? val[0] : val;
              if (typeof next === 'number') {
                if (error) {
                  setError(null);
                }
                setZoom(next);
              }
            }}
            step={0.05}
            value={[zoom]}
          />
        </div>

        {error ? (
          <p className="font-medium text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button
            disabled={isProcessing || !imageSrc}
            onClick={handleConfirm}
            type="button"
          >
            {!!isProcessing && <Spinner />}
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
