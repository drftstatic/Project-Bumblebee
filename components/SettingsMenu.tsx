
import React from 'react';
import { ExportIcon, ShareIcon, TrashIcon } from './icons';

interface SettingsMenuProps {
  onClear: () => void;
  onExport: () => void;
  onShare: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onClear, onExport, onShare }) => {
  return (
    <div 
        className="absolute right-0 mt-2 w-56 origin-top-right bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20 animate-fade-in"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="menu-button"
    >
      <div className="py-1" role="none">
        <button
          onClick={onShare}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          role="menuitem"
        >
          <ShareIcon />
          <span>Share App</span>
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          role="menuitem"
        >
          <ExportIcon />
          <span>Export Chat</span>
        </button>
        <button
          onClick={onClear}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
          role="menuitem"
        >
          <TrashIcon />
          <span>Clear Conversation</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsMenu;
