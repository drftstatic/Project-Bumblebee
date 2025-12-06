
import React from 'react';
import { CameraIcon, ChatBubbleIcon } from './icons';

interface InitialScreenProps {
  onTellMe: () => void;
  onShowMe: () => void;
}

const InitialScreen: React.FC<InitialScreenProps> = ({ onTellMe, onShowMe }) => {


  const handleShowMeClick = () => {
    // This component doesn't handle the file logic, just passes the event up
    onShowMe();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="max-w-md">
        <h2 className="text-4xl font-extrabold text-yellow-300 mb-4 will-animate animate-fade-in-up">I'm Bumblebee</h2>
        <p className="text-lg text-gray-300 mb-8 will-animate animate-fade-in-up delay-100">
          I'll respond visually to whatever you share. Let's build a visual language, together.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 will-animate animate-fade-in-up delay-200">
          <button
            onClick={handleShowMeClick}
            className="flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-all duration-200 ease-in-out transform hover:-translate-y-1"
          >
            <CameraIcon />
            Show me
          </button>
          <button
            onClick={onTellMe}
            className="flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-lg shadow-md hover:bg-yellow-400 transition-all duration-200 ease-in-out transform hover:-translate-y-1"
          >
            <ChatBubbleIcon />
            Tell me
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitialScreen;
