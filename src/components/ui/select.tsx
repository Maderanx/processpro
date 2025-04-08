import React, { useState, useRef, useEffect } from 'react';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const SelectContext = React.createContext<SelectContextType>({
  value: '',
  onValueChange: () => {},
});

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  children?: React.ReactNode;
  placeholder?: string;
  className?: string;
}

export function Select({ value, onValueChange, children, className = '' }: SelectProps) {
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      <div className={`relative ${className}`}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className = '' }: SelectTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const context = React.useContext(SelectContext);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <button
      ref={triggerRef}
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-4 w-4 opacity-50 ${isOpen ? 'rotate-180' : ''}`}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

export function SelectContent({ children, className = '' }: SelectContentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const context = React.useContext(SelectContext);
  
  if (!isOpen) {
    return null;
  }
  
  return (
    <div className={`absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg ${className}`}>
      <div className="py-1">
        {children}
      </div>
    </div>
  );
}

export function SelectItem({ value, children, className = '' }: SelectItemProps) {
  const context = React.useContext(SelectContext);
  const isSelected = context.value === value;
  
  return (
    <button
      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${isSelected ? 'bg-blue-50 text-blue-600' : ''} ${className}`}
      onClick={() => {
        context.onValueChange(value);
      }}
    >
      {children}
    </button>
  );
}

export function SelectValue({ children, placeholder, className = '' }: SelectValueProps) {
  const context = React.useContext(SelectContext);
  
  return (
    <span className={`${className}`}>
      {children || placeholder || 'Select an option'}
    </span>
  );
} 