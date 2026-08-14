'use client';

import { useState } from 'react';
import Cropper from 'react-easy-crop';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const EXTENSION_REGEX = /\.[^.]+$/;

export interface Area {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface CropDialogProps {
  aspect?: number; // 1 for avatar, 1200 / 630 for cover
  cropShape?: 'rect' | 'round'; // "round" for avatar, "rect" for cover
  fileName?: string;
  imageSrc: string | null;
  onCancel?: () => void;
  onCropConfirm: (croppedFile: File) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title?: string;
}

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  fileName = 'cropped.webp',
  mimeType = 'image/webp',
  quality = 0.92
): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas export failed'));
          return;
        }
        resolve(
          new File([blob], fileName.replace(EXTENSION_REGEX, '.webp'), {
            type: blob.type,
          })
        );
      },
      mimeType,
      quality
    );
  });
}

export function CropDialog({
  open,
  onOpenChange,
  imageSrc,
  aspect = 1,
  cropShape = 'rect',
  title = 'Crop image',
  fileName = 'cropped.webp',
  onCropConfirm,
  onCancel,
}: CropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onCancel?.();
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!(imageSrc && croppedAreaPixels)) {
      return;
    }
    try {
      setIsProcessing(true);
      const croppedFile = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        fileName
      );
      onCropConfirm(croppedFile);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to crop image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Drag to reposition and adjust zoom to crop your image.
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-80 w-full overflow-hidden rounded-md bg-black">
          {imageSrc ? (
            <Cropper
              aspect={aspect}
              crop={crop}
              cropShape={cropShape}
              image={imageSrc}
              onCropChange={setCrop}
              onCropComplete={(_croppedArea, newCroppedAreaPixels) => {
                setCroppedAreaPixels(newCroppedAreaPixels);
              }}
              onZoomChange={setZoom}
              showGrid={cropShape === 'rect'}
              zoom={zoom}
            />
          ) : null}
        </div>

        <div className="flex items-center gap-3 py-2">
          <span className="text-muted-foreground text-xs">Zoom</span>
          <input
            aria-label="Zoom"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
            max={3}
            min={1}
            onChange={(e) => setZoom(Number(e.target.value))}
            step={0.05}
            type="range"
            value={zoom}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            disabled={isProcessing}
            onClick={() => handleOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={isProcessing || !imageSrc}
            onClick={handleConfirm}
            type="button"
          >
            {isProcessing ? 'Cropping...' : 'Apply Crop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
