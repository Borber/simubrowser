import React, { useState, KeyboardEvent } from 'react';
import { Search } from 'lucide-react';

interface AddressBarProps {
  currentUrl: string;
  onNavigate: (url: string) => void;
}

export function AddressBar({ currentUrl, onNavigate }: AddressBarProps) {
  const [inputValue, setInputValue] = useState(currentUrl);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      let url = inputValue.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      onNavigate(url);
    }
  };

  return (
    <div className="flex items-center bg-white rounded-lg px-3 py-2 shadow-sm border">
      <Search className="w-4 h-4 text-gray-400 mr-2" />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-1 outline-none text-sm"
        placeholder="Enter URL or search"
      />
    </div>
  );
}