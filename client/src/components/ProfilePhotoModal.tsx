import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Upload, Camera, ZoomIn, ZoomOut, Check, Sparkles, User as UserIcon, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { api, User } from '../api/client';

interface ProfilePhotoModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (updatedUser: User) => void;
}

const DEFAULT_AVATARS = [
  { id: 'avatar_scholar', label: 'Scholar', emoji: '👨‍🎓', bg: 'from-amber-400 to-orange-500' },
  { id: 'avatar_medic', label: 'Medic', emoji: '👩‍⚕️', bg: 'from-teal-400 to-emerald-600' },
  { id: 'avatar_engineer', label: 'Engineer', emoji: '⚡', bg: 'from-blue-500 to-indigo-600' },
  { id: 'avatar_scientist', label: 'Scientist', emoji: '🔬', bg: 'from-purple-500 to-pink-500' },
  { id: 'avatar_math', label: 'Mathlete', emoji: '📐', bg: 'from-cyan-400 to-blue-600' },
  { id: 'avatar_astro', label: 'Astronaut', emoji: '🚀', bg: 'from-violet-600 to-slate-900' },
  { id: 'avatar_bio', label: 'Biologist', emoji: '🧬', bg: 'from-emerald-400 to-teal-700' },
  { id: 'avatar_fox', label: 'Clever Fox', emoji: '🦊', bg: 'from-orange-400 to-rose-500' }
];

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  user,
  isOpen,
  onClose,
  onUserUpdated
}) => {
  // All hooks MUST be declared unconditionally at the top level
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgElementRef = useRef<HTMLImageElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Reset state whenever modal is opened or closed
  useEffect(() => {
    if (!isOpen) {
      setImageSrc(null);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setError(null);
      setSuccessMsg(null);
      setLoading(false);
    }
  }, [isOpen]);

  // Render the cropped image onto canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgElementRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgElementRef.current;
    const size = 512;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // Fill white background for transparent PNGs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Save and apply transformations (centering, pan, zoom)
    ctx.save();
    ctx.translate(size / 2 + pan.x, size / 2 + pan.y);
    ctx.scale(zoom, zoom);

    // Maintain aspect ratio cover
    const aspect = img.width / img.height;
    let drawW = size;
    let drawH = size;
    if (aspect > 1) {
      drawW = size * aspect;
    } else {
      drawH = size / aspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [zoom, pan]);

  // Re-render canvas when image source, zoom, or pan updates
  useEffect(() => {
    if (!isOpen || !imageSrc || !canvasRef.current) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imgElementRef.current = img;
      renderCanvas();
    };
  }, [isOpen, imageSrc, renderCanvas]);

  // Handle image file selection (from phone gallery or camera)
  const processSelectedFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    setError(null);
    setLoading(true);

    // Use FileReader to read into memory and downscale if too large
    const reader = new FileReader();
    reader.onerror = () => {
      setError('Unable to read selected file from gallery.');
      setLoading(false);
    };

    reader.onload = () => {
      const dataUrl = reader.result as string;
      const tempImg = new Image();
      tempImg.onload = () => {
        try {
          // If the photo is very large (e.g. 12-48MP from phone camera), downscale to max 1200px
          const maxDim = 1200;
          let targetW = tempImg.width;
          let targetH = tempImg.height;

          if (targetW > maxDim || targetH > maxDim) {
            if (targetW > targetH) {
              targetH = Math.round((targetH * maxDim) / targetW);
              targetW = maxDim;
            } else {
              targetW = Math.round((targetW * maxDim) / targetH);
              targetH = maxDim;
            }
          }

          const offscreenCanvas = document.createElement('canvas');
          offscreenCanvas.width = targetW;
          offscreenCanvas.height = targetH;
          const offCtx = offscreenCanvas.getContext('2d');
          if (offCtx) {
            offCtx.drawImage(tempImg, 0, 0, targetW, targetH);
            const optimizedUrl = offscreenCanvas.toDataURL('image/jpeg', 0.9);
            setImageSrc(optimizedUrl);
          } else {
            setImageSrc(dataUrl);
          }
          setZoom(1);
          setPan({ x: 0, y: 0 });
        } catch {
          setImageSrc(dataUrl);
        } finally {
          setLoading(false);
        }
      };
      tempImg.onerror = () => {
        setError('Failed to process image format.');
        setLoading(false);
      };
      tempImg.src = dataUrl;
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
    // Reset input value so re-selecting the same file triggers change
    e.target.value = '';
  };

  // Mouse pan handlers (for desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch pan handlers (for mobile phone screens)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageSrc || e.touches.length === 0) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    const touch = e.touches[0];
    setPan({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Save cropped photo
  const handleSavePhoto = async () => {
    if (!canvasRef.current || !imageSrc) return;
    setLoading(true);
    setError(null);
    try {
      const base64 = canvasRef.current.toDataURL('image/jpeg', 0.85);
      const res = await api.uploadProfilePhoto({ photo_base64: base64 });
      onUserUpdated(res.user);
      setSuccessMsg('Profile photo updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile photo.');
    } finally {
      setLoading(false);
    }
  };

  // Select default avatar
  const handleSelectDefaultAvatar = async (avatarId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.setDefaultAvatar({ avatar_id: avatarId });
      onUserUpdated(res.user);
      setSuccessMsg('Avatar updated successfully!');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Failed to set avatar.');
    } finally {
      setLoading(false);
    }
  };

  // IMPORTANT: Condition check is placed AFTER all hooks are defined
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 relative my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5 pr-6">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">Customize Profile Photo</h3>
          <p className="text-xs text-slate-500 mt-1">
            Pick from your phone gallery, take a photo, or choose a student avatar.
          </p>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center justify-center space-x-1.5">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Circular Crop Preview Canvas or Current Photo */}
        <div className="flex flex-col items-center mb-5">
          <div
            className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-full border-4 border-teal-500/30 overflow-hidden shadow-xl bg-slate-100 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
            style={{ touchAction: 'none' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {imageSrc ? (
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover pointer-events-none"
              />
            ) : user.profile_photo_url ? (
              user.profile_photo_url.startsWith('avatar:') ? (
                <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-tr from-teal-400 to-indigo-600 text-white select-none">
                  {DEFAULT_AVATARS.find(a => `avatar:${a.id}` === user.profile_photo_url)?.emoji || '🎓'}
                </div>
              ) : (
                <img
                  src={user.profile_photo_url}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                <UserIcon className="w-16 h-16" />
              </div>
            )}

            {/* Subtle drag hint overlay if an image is loaded */}
            {imageSrc && (
              <div className="absolute inset-0 border border-teal-400/40 rounded-full pointer-events-none" />
            )}
          </div>

          {/* Controls when an image is selected for crop */}
          {imageSrc ? (
            <div className="w-full max-w-xs mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold px-1">
                <span className="flex items-center space-x-1">
                  <ZoomIn className="w-3.5 h-3.5 text-teal-600" />
                  <span>Zoom & Adjust Face</span>
                </span>
                <span className="text-teal-700 font-bold">{Math.round(zoom * 100)}%</span>
              </div>

              {/* Zoom Slider with Quick Step Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.max(1, +(z - 0.1).toFixed(2)))}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  title="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.05"
                  value={zoom}
                  onChange={e => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-teal-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.min(2.5, +(z + 0.1).toFixed(2)))}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  title="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-center text-slate-400">
                Drag with your finger/mouse to center your photo
              </p>

              {/* Action Buttons for cropped image */}
              <div className="flex justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setImageSrc(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Choose Another
                </button>
                <button
                  type="button"
                  onClick={handleSavePhoto}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5 transition-all active:scale-95"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Photo</span>
                </button>
              </div>
            </div>
          ) : (
            /* Upload buttons: Phone Gallery & Camera */
            <div className="mt-4 w-full max-w-xs space-y-2">
              {/* Hidden file inputs */}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="grid grid-cols-2 gap-2">
                {/* 1. Phone Gallery Button */}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-500/20 cursor-pointer active:scale-95 transition-all"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Phone Gallery</span>
                </button>

                {/* 2. Take Photo / Camera Button */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Photo</span>
                </button>
              </div>
              <p className="text-[11px] text-center text-slate-400">
                Supports JPG, PNG, WEBP from your phone
              </p>
            </div>
          )}
        </div>

        {/* DEFAULT AVATARS GALLERY */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Or Choose a Quick Student Avatar</span>
            </span>
            <span className="text-[11px] text-slate-400">1-Tap Selection</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {DEFAULT_AVATARS.map(avatar => {
              const isSelected = user.profile_photo_url === `avatar:${avatar.id}`;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => handleSelectDefaultAvatar(avatar.id)}
                  disabled={loading}
                  className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center cursor-pointer ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50 shadow-xs ring-2 ring-teal-400/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl mb-0.5">{avatar.emoji}</span>
                  <span className="text-[10px] font-semibold text-slate-700 truncate w-full">{avatar.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
