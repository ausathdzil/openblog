'use client';

import { createContext, use, useState } from 'react';
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
import { Slider } from '@/components/ui/slider';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';

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

interface CropDialogContextValue {
  aspect: number;
  crop: { x: number; y: number };
  croppedAreaPixels: Area | null;
  cropShape: 'rect' | 'round';
  handleConfirm: () => Promise<void>;
  imageSrc: string | null;
  isProcessing: boolean;
  setCrop: (crop: { x: number; y: number }) => void;
  setCroppedAreaPixels: (area: Area | null) => void;
  setZoom: (zoom: number) => void;
  zoom: number;
}

const CropDialogContext = createContext<CropDialogContextValue | null>(null);

function useCropDialog() {
  const context = use(CropDialogContext);
  if (!context) {
    throw new Error(
      'CropDialog compound components must be used within CropDialog.Root'
    );
  }
  return context;
}

interface CropDialogRootProps {
  aspect?: number;
  children: React.ReactNode;
  cropShape?: 'rect' | 'round';
  fileName?: string;
  imageSrc: string | null;
  mimeType?: string;
  onCancel?: () => void;
  onCropConfirm: (croppedFile: File) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

function CropDialogRoot({
  open,
  onOpenChange,
  imageSrc,
  aspect = 1,
  cropShape = 'rect',
  fileName = 'cropped.jpg',
  mimeType = 'image/jpeg',
  onCropConfirm,
  onCancel,
  children,
}: CropDialogRootProps) {
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
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <CropDialogContext
      value={{
        crop,
        setCrop,
        zoom,
        setZoom,
        croppedAreaPixels,
        setCroppedAreaPixels,
        isProcessing,
        imageSrc,
        aspect,
        cropShape,
        handleConfirm,
      }}
    >
      <Dialog onOpenChange={handleOpenChange} open={open}>
        {children}
      </Dialog>
    </CropDialogContext>
  );
}

function CropDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      className={cn(
        'data-open:zoom-in-100 data-closed:zoom-out-100 sm:max-w-2xl',
        className
      )}
      {...props}
    >
      {children}
    </DialogContent>
  );
}

function CropDialogCropper({ className }: { className?: string }) {
  const {
    imageSrc,
    aspect,
    crop,
    setCrop,
    cropShape,
    setCroppedAreaPixels,
    zoom,
    setZoom,
  } = useCropDialog();

  return (
    <div
      className={cn(
        'relative h-80 w-full overflow-hidden rounded-md bg-black',
        className
      )}
    >
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
          restrictPosition={true}
          showGrid={cropShape === 'rect'}
          zoom={zoom}
        />
      ) : null}
    </div>
  );
}

function CropDialogZoom({ className }: { className?: string }) {
  const { zoom, setZoom } = useCropDialog();

  return (
    <div className={cn('grid w-full gap-3', className)}>
      <Label htmlFor="zoom">Zoom</Label>
      <Slider
        id="zoom"
        max={3}
        min={1}
        onValueChange={(val) => {
          const next = Array.isArray(val) ? val[0] : val;
          if (typeof next === 'number') {
            setZoom(next);
          }
        }}
        step={0.05}
        value={[zoom]}
      />
    </div>
  );
}

function CropDialogApply({
  children = 'Apply Crop',
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { isProcessing, imageSrc, handleConfirm } = useCropDialog();

  return (
    <Button
      className={className}
      disabled={isProcessing || !imageSrc}
      onClick={handleConfirm}
      type="button"
      {...props}
    >
      {!!isProcessing && <Spinner />}
      {children}
    </Button>
  );
}

export const CropDialog = Object.assign(CropDialogRoot, {
  Apply: CropDialogApply,
  Close: DialogClose,
  Content: CropDialogContent,
  Cropper: CropDialogCropper,
  Description: DialogDescription,
  Footer: DialogFooter,
  Header: DialogHeader,
  Root: CropDialogRoot,
  Title: DialogTitle,
  Zoom: CropDialogZoom,
});
