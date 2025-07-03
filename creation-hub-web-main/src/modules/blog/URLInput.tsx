
import React, { useState, KeyboardEvent } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { X, Link, Plus } from 'lucide-react';

interface URLInputProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  placeholder?: string;
}

export const URLInput: React.FC<URLInputProps> = ({
  urls,
  onChange,
  placeholder = "Add URL..."
}) => {
  const [inputValue, setInputValue] = useState('');

  const isValidURL = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addURL();
    }
  };

  const addURL = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && isValidURL(trimmedValue) && !urls.includes(trimmedValue)) {
      onChange([...urls, trimmedValue]);
      setInputValue('');
    }
  };

  const removeURL = (urlToRemove: string) => {
    onChange(urls.filter(url => url !== urlToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="border-gray-200"
        />
        <Button
          type="button"
          onClick={addURL}
          variant="outline"
          size="sm"
          className="shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {urls.length > 0 && (
        <div className="space-y-2">
          {urls.map((url, index) => (
            <Badge
              key={index}
              variant="outline"
              className="flex items-center justify-between w-full p-2 bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex items-center gap-2 truncate">
                <Link className="w-3 h-3 text-gray-500 shrink-0" />
                <span className="text-sm truncate">{url}</span>
              </div>
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-600 shrink-0"
                onClick={() => removeURL(url)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
