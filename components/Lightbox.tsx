
import React, { useEffect, useState, useCallback } from 'react';

interface LightboxProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose, goToPrevious, goToNext]);

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .gallery-image { animation: scaleIn 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
      `}</style>
      
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Main Image */}
        <div 
          className="relative max-w-5xl max-h-[90vh] shadow-2xl rounded-lg flex items-center justify-center"
          onClick={(e) => e.stopPropagation()} 
        >
          <img 
            key={currentIndex}
            src={`data:image/png;base64,${images[currentIndex]}`} 
            alt={`Lightbox view ${currentIndex + 1} of ${images.length}`} 
            className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-lg gallery-image" 
          />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/20 text-white rounded-full h-10 w-10 flex items-center justify-center text-2xl font-bold hover:scale-110 hover:bg-white/30 transition-all shadow-lg"
          aria-label="Close lightbox"
        >
          &times;
        </button>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full h-12 w-12 flex items-center justify-center text-3xl hover:bg-white/30 transition-colors"
              aria-label="Previous image"
            >
              &#8249;
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full h-12 w-12 flex items-center justify-center text-3xl hover:bg-white/30 transition-colors"
              aria-label="Next image"
            >
              &#8250;
            </button>
          </>
        )}
        
        {/* Counter */}
        {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                {currentIndex + 1} / {images.length}
            </div>
        )}
      </div>
    </div>
  );
};

export default Lightbox;
