
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, ViewState } from './types';
import { getVisualResponse } from './services/geminiService';
import InitialScreen from './components/InitialScreen';
import MessageInput from './components/MessageInput';
import ChatBubble from './components/ChatBubble';
import Lightbox from './components/Lightbox';
import { LogoIcon, SettingsIcon } from './components/icons';
import SettingsMenu from './components/SettingsMenu';

interface LightboxState {
  images: string[];
  startIndex: number;
}

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.Initial);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [prefilledInput, setPrefilledInput] = useState<string>('');
  const [lightboxState, setLightboxState] = useState<LightboxState | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);
  
  // Hook to close settings menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSendMessage = useCallback(async (text: string, imageBase64?: string) => {
    setPrefilledInput(''); // Clear any pre-filled text
    if (viewState === ViewState.Initial) {
      setViewState(ViewState.Chat);
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      text: text,
      images: imageBase64 ? [imageBase64] : [],
    };

    setChatHistory(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResponse = await getVisualResponse(text, chatHistory, imageBase64);
      
      const modelMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'model',
        text: '',
        images: aiResponse.images,
        thinking: aiResponse.thinking,
        sources: aiResponse.groundingSources,
      };

      setChatHistory(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error("Error getting visual response:", error);
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'model',
        text: "Sorry, I encountered an error while generating a visual response. Please try again.",
        images: [],
        isError: true,
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [viewState, chatHistory]);
  
  const handleAction = (action: 'Clarify' | 'Add more', originalPrompt: string) => {
    const promptText = action === 'Clarify'
      ? `Regarding my last prompt ("${originalPrompt}"), `
      : `Building on my last prompt ("${originalPrompt}"), `;
    
    setPrefilledInput(promptText);
    messageInputRef.current?.focus();
    messageInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear this conversation? This action cannot be undone.')) {
        setChatHistory([]);
        setViewState(ViewState.Initial);
        setIsSettingsOpen(false);
    }
  };

  const generateChatExportHTML = (history: ChatMessage[]): string => {
    const styles = `
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #111827; color: #f3f4f6; margin: 0; padding: 2rem; }
      .container { max-width: 800px; margin: auto; }
      h1 { color: #facc15; text-align: center; border-bottom: 1px solid #374151; padding-bottom: 1rem; margin-bottom: 2rem;}
      .message { display: flex; margin-bottom: 1.5rem; max-width: 85%; }
      .message.user { justify-content: flex-end; margin-left: auto; }
      .message.model { justify-content: flex-start; margin-right: auto; }
      .bubble { padding: 1rem; border-radius: 1rem; }
      .user .bubble { background-color: #facc15; color: #111827; border-bottom-right-radius: 0.25rem; }
      .model .bubble { background-color: #1f2937; color: #d1d5db; border-bottom-left-radius: 0.25rem; }
      p { margin: 0; white-space: pre-wrap; word-wrap: break-word; }
      .images { margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem; }
      img { max-width: 100%; height: auto; border-radius: 0.75rem; border: 1px solid #374151; }
    `;

    let bodyContent = '';
    for (const msg of history) {
      const imagesHTML = msg.images.map(img => `<img src="data:image/png;base64,${img}" alt="${msg.role} image" />`).join('');
      
      bodyContent += `
        <div class="message ${msg.role}">
          <div class="bubble">
            ${msg.text ? `<p>${msg.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>` : ''}
            ${imagesHTML ? `<div class="images">${imagesHTML}</div>` : ''}
          </div>
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Bumblebee Chat Export</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="container">
          <h1>Project Bumblebee Chat Export</h1>
          ${bodyContent}
        </div>
      </body>
      </html>
    `;
  };

  const handleExportChat = () => {
    const htmlContent = generateChatExportHTML(chatHistory);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bumblebee-chat-${new Date().toISOString()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsSettingsOpen(false);
  };
  
  const handleShare = async () => {
    const shareData = {
      title: 'Project Bumblebee',
      text: 'Check out Project Bumblebee, an experimental AI that communicates visually!',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      alert('Could not share. Please copy the link from the address bar.');
    } finally {
        setIsSettingsOpen(false);
    }
  };

  const startChatWithText = () => {
    setViewState(ViewState.Chat);
  };
  
  const startChatWithImage = () => {
    setViewState(ViewState.Chat);
    // The MessageInput component will handle the file dialog opening
  };

  const handleOpenLightbox = (images: string[], startIndex: number) => {
    setLightboxState({ images, startIndex });
  };

  const handleCloseLightbox = () => {
    setLightboxState(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {lightboxState && <Lightbox images={lightboxState.images} startIndex={lightboxState.startIndex} onClose={handleCloseLightbox} />}
      <header className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <LogoIcon />
          <h1 className="text-xl font-bold text-yellow-400">Project Bumblebee</h1>
        </div>
        <div className="relative" ref={settingsRef}>
            <button 
                onClick={() => setIsSettingsOpen(prev => !prev)}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-haspopup="true"
                aria-expanded={isSettingsOpen}
            >
                <SettingsIcon />
            </button>
            {isSettingsOpen && (
                <SettingsMenu 
                    onClear={handleClearChat}
                    onExport={handleExportChat}
                    onShare={handleShare}
                />
            )}
        </div>
      </header>

      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        {viewState === ViewState.Initial ? (
          <InitialScreen onTellMe={startChatWithText} onShowMe={startChatWithImage} />
        ) : (
          <div className="max-w-3xl mx-auto w-full space-y-8">
            {chatHistory.map((msg, index) => (
              <ChatBubble 
                key={msg.id} 
                message={msg} 
                onAction={(action) => handleAction(action, chatHistory[index - 1]?.text || '')} 
                onImageClick={(imageIndex) => handleOpenLightbox(msg.images, imageIndex)}
              />
            ))}
            {isLoading && (
              <div className="flex justify-center items-center gap-4 py-4 animate-fade-in">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                <p className="text-gray-400">Bumblebee is thinking...</p>
              </div>
            )}
          </div>
        )}
      </main>

      {viewState === ViewState.Initial && (
        <footer className="p-4 text-center text-sm text-gray-500">
          An experiment by <a href="https://fladrycreative.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-400">Fladry Creative.</a>
        </footer>
      )}

      {viewState === ViewState.Chat && (
        <footer className="p-4 md:p-6 border-t border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky bottom-0">
          <div className="max-w-3xl mx-auto">
            <MessageInput
              ref={messageInputRef}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              prefilledText={prefilledInput}
            />
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
