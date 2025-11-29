
import React from 'react';

interface ImageGridProps {
  images: string[];
  onImageClick: (index: number) => void;
}

const ImageItem: React.FC<{ img: string; index: number; onImageClick: (index: number) => void; className?: string; overlayText?: string; }> = ({ img, index, onImageClick, className = '', overlayText }) => (
  <div
    className={`relative overflow-hidden rounded-lg cursor-pointer group shadow-lg border border-gray-700/50 ${className}`}
    onClick={() => onImageClick(index)}
  >
    <img
      src={`data:image/png;base64,${img}`}
      alt={`Visual asset ${index + 1}`}
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    {overlayText && (
      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
        <span className="text-white text-2xl font-bold">{overlayText}</span>
      </div>
    )}
  </div>
);

const ImageGrid: React.FC<ImageGridProps> = ({ images, onImageClick }) => {
  const count = images.length;

  if (count === 0) return null;

  if (count === 1) {
    return <ImageItem img={images[0]} index={0} onImageClick={onImageClick} />;
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <ImageItem img={images[0]} index={0} onImageClick={onImageClick} />
        <ImageItem img={images[1]} index={1} onImageClick={onImageClick} />
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-2 aspect-[4/3]">
        <ImageItem img={images[0]} index={0} onImageClick={onImageClick} className="col-span-2 row-span-1" />
        <ImageItem img={images[1]} index={1} onImageClick={onImageClick} className="col-span-1 row-span-1" />
        <ImageItem img={images[2]} index={2} onImageClick={onImageClick} className="col-span-1 row-span-1" />
      </div>
    );
  }

  if (count === 4) {
    return (
        <div className="grid grid-cols-2 grid-rows-2 gap-2 aspect-square">
            <ImageItem img={images[0]} index={0} onImageClick={onImageClick} />
            <ImageItem img={images[1]} index={1} onImageClick={onImageClick} />
            <ImageItem img={images[2]} index={2} onImageClick={onImageClick} />
            <ImageItem img={images[3]} index={3} onImageClick={onImageClick} />
        </div>
    );
  }

  // 5 or more images
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-2 aspect-square">
        <ImageItem img={images[0]} index={0} onImageClick={onImageClick} />
        <ImageItem img={images[1]} index={1} onImageClick={onImageClick} />
        <ImageItem img={images[2]} index={2} onImageClick={onImageClick} />
        <ImageItem img={images[3]} index={3} onImageClick={onImageClick} overlayText={`+${count - 4}`} />
    </div>
  );
};

export default ImageGrid;
