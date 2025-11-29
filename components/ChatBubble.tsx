
import React, { useState } from 'react';
import { ChatMessage } from '../types';
import ThinkingLayer from './ThinkingLayer';
import ImageGrid from './ImageGrid';
import { BrainIcon, DownloadIcon, LinkIcon } from './icons';

interface ChatBubbleProps {
  message: ChatMessage;
  onAction: (action: 'Clarify' | 'Add more') => void;
  onImageClick: (index: number) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onAction, onImageClick }) => {
  const [showThinking, setShowThinking] = useState(false);
  const isUser = message.role === 'user';

  const handleDownload = () => {
    message.images.forEach((base64Img, index) => {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${base64Img}`;
      link.download = `bumblebee-${message.id}-image-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end ml-auto max-w-lg lg:max-w-xl animate-fade-in-up">
        <div className="flex flex-col items-end w-full space-y-2">
          {message.text && (
            <div className="bg-yellow-500 text-gray-900 rounded-xl rounded-br-none p-4">
              <p>{message.text}</p>
            </div>
          )}
          {message.images.length > 0 && (
            <div className="w-full">
                <ImageGrid images={message.images} onImageClick={onImageClick} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // AI Model Bubble
  return (
    <div className="flex justify-start animate-fade-in-up">
      <div className="max-w-lg lg:max-w-xl">
        <div className="bg-gray-800 rounded-xl rounded-bl-none p-4">
          {message.isError ? (
            <p className="text-red-400">{message.text}</p>
          ) : (
            <div className="space-y-4">
              {message.images.length === 0 && message.thinking && (
                <p className="text-gray-400 italic">{message.thinking.visualApproach}</p>
              )}
              {message.images.length > 0 && (
                <ImageGrid images={message.images} onImageClick={onImageClick} />
              )}
            </div>
          )}
        </div>
        {!message.isError && (
          <div className="mt-3 text-sm space-y-3">
            <div className="flex flex-wrap gap-2">
              {message.thinking && (
                <button
                  onClick={() => setShowThinking(!showThinking)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    showThinking ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <BrainIcon />
                  {showThinking ? 'Hide thinking' : 'Show thinking'}
                </button>
              )}
              {message.images && message.images.length > 0 && (
                 <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                >
                  <DownloadIcon />
                  Download
                </button>
              )}
              <button onClick={() => onAction('Clarify')} className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
                Clarify
              </button>
              <button onClick={() => onAction('Add more')} className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
                Add more
              </button>
            </div>
            {showThinking && message.thinking && <ThinkingLayer thinking={message.thinking} />}
            
            {message.sources && message.sources.length > 0 && (
              <div className="pt-2">
                 <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    <LinkIcon />
                    Sources
                 </h4>
                 <ul className="space-y-1">
                    {message.sources.map((source, index) => (
                        <li key={index}>
                            <a 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-yellow-400 hover:text-yellow-300 underline truncate block"
                                title={source.uri}
                            >
                                {source.title}
                            </a>
                        </li>
                    ))}
                 </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
