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

const EXTENSION_REGEX = /\.[^.]+$/;

async function getCroppedImg(
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
  fileName = 'cropped.webp',
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
    const croppedFile = await getCroppedImg(
      imageSrc,
      croppedAreaPixels,
      fileName
    );
    setIsProcessing(false);
    onCropConfirm(croppedFile);
    onOpenChange(false);
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
    <DialogContent className={cn('sm:max-w-2xl', className)} {...props}>
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
