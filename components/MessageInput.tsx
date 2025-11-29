
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CameraIcon, SendIcon } from './icons';

interface MessageInputProps {
  onSendMessage: (text: string, imageBase64?: string) => void;
  isLoading: boolean;
  prefilledText?: string;
}

const MessageInput = forwardRef<HTMLInputElement, MessageInputProps>(
  ({ onSendMessage, isLoading, prefilledText }, ref) => {
    const [text, setText] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const localInputRef = useRef<HTMLInputElement>(null);

    // Expose the local input ref to the parent component
    useImperativeHandle(ref, () => localInputRef.current!, []);

    useEffect(() => {
      // Use a check to avoid clearing the input if the user is typing when a re-render occurs
      if (prefilledText && prefilledText !== text) {
        setText(prefilledText);
      }
    }, [prefilledText]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleImageUploadClick = () => {
      fileInputRef.current?.click();
    };
    
    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const handleSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      if (isLoading || (!text.trim() && !imageFile)) return;

      if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          onSendMessage(text, base64String);
          setText('');
          removeImage();
        };
        reader.readAsDataURL(imageFile);
      } else {
        onSendMessage(text);
        setText('');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        {imagePreview && (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden animate-fade-in">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 text-xs hover:bg-black/80"
            >
              &#x2715;
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-xl border border-gray-700 focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400/50 transition-all">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <button
            type="button"
            onClick={handleImageUploadClick}
            className="p-2 text-gray-400 hover:text-yellow-400 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Upload image"
          >
            <CameraIcon />
          </button>
          <input
            type="text"
            ref={localInputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or upload an image..."
            className="flex-1 bg-transparent focus:outline-none text-gray-100 placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || (!text.trim() && !imageFile)}
            className="p-2 rounded-full bg-yellow-500 text-gray-900 disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-yellow-400 transition-colors"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </form>
    );
  }
);

export default MessageInput;
