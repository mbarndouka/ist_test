import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DropdownOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps<T = string> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Dropdown<T extends string = string>({
  options,
  value,
  onChange,
  icon,
  placeholder = 'Select an option',
  className,
  disabled = false
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-between rounded-lg font-medium transition-all duration-200',
          'px-5 py-2.5 text-sm',
          'bg-white text-[#111111] hover:bg-gray-50 border border-gray-200 shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'min-w-[180px]',
          className
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center">
          {icon && <span className="mr-2 text-gray-500">{icon}</span>}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'w-3 h-3 text-gray-400 ml-2 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-20 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150"
          role="listbox"
        >
          {options.map((option) => (
            <div
              key={String(option.value)}
              onClick={() => handleSelect(option.value)}
              className={cn(
                'px-4 py-2.5 text-sm cursor-pointer transition-all flex items-center justify-between',
                value === option.value
                  ? 'bg-[#ccff00]/10 text-[#111] font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#111]'
              )}
              role="option"
              aria-selected={value === option.value}
            >
              <span className="flex items-center">
                {option.icon && <span className="mr-2">{option.icon}</span>}
                {option.label}
              </span>
              {value === option.value && <Check className="w-3.5 h-3.5 text-[#111]" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
