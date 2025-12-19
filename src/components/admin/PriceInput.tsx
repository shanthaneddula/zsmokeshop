'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface PriceInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  label?: string;
  required?: boolean;
  allowEmpty?: boolean;
}

/**
 * PriceInput Component
 * 
 * A specialized input for currency/price entry that fills from the right.
 * As users type digits, they fill from right to left in the decimal positions.
 * 
 * Examples:
 * - Type "2" → $0.02
 * - Type "20" → $0.20
 * - Type "200" → $2.00
 * - Type "2000" → $20.00
 * - Type "20000" → $200.00
 * 
 * This mimics how cash registers and POS systems work, making it intuitive
 * for retail staff familiar with that workflow.
 */
export function PriceInput({
  value,
  onChange,
  placeholder = '0.00',
  className = '',
  error,
  label,
  required = false,
  allowEmpty = false
}: PriceInputProps) {
  // Convert number to display string (e.g., 20.00 → "2000")
  const valueToDigits = useCallback((val: number | undefined): string => {
    if (val === undefined || val === 0) return '';
    // Convert to cents and remove any decimal artifacts
    const cents = Math.round(val * 100);
    return cents.toString();
  }, []);

  // Convert digits string to formatted display (e.g., "2000" → "20.00")
  const digitsToDisplay = useCallback((digits: string): string => {
    if (!digits) return placeholder;
    
    // Pad with leading zeros if needed
    const paddedDigits = digits.padStart(3, '0');
    const len = paddedDigits.length;
    
    // Insert decimal point 2 positions from the right
    const dollars = paddedDigits.slice(0, len - 2) || '0';
    const cents = paddedDigits.slice(-2);
    
    return `${dollars}.${cents}`;
  }, [placeholder]);

  // Convert digits to number value
  const digitsToValue = useCallback((digits: string): number => {
    if (!digits) return 0;
    return parseInt(digits, 10) / 100;
  }, []);

  const [digits, setDigits] = useState<string>(valueToDigits(value));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes
  useEffect(() => {
    if (!isFocused) {
      setDigits(valueToDigits(value));
    }
  }, [value, isFocused, valueToDigits]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 46, 9, 27, 13].includes(e.keyCode)) {
      if (e.key === 'Backspace') {
        e.preventDefault();
        const newDigits = digits.slice(0, -1);
        setDigits(newDigits);
        const newValue = digitsToValue(newDigits);
        onChange(newDigits === '' && allowEmpty ? undefined : newValue);
      }
      return;
    }
    
    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey || e.metaKey) {
      return;
    }
    
    // Only allow digits
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    // Limit to reasonable price (max $999,999.99)
    if (digits.length >= 8) {
      e.preventDefault();
      return;
    }
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const inputValue = input.value;
    
    // Extract only digits from input
    const newDigit = inputValue.replace(/\D/g, '').slice(-1);
    
    if (newDigit) {
      // If starting fresh (was 0 or empty), start with the new digit
      // Otherwise append the new digit
      const newDigits = digits + newDigit;
      
      // Limit to reasonable price
      if (newDigits.length <= 8) {
        setDigits(newDigits);
        onChange(digitsToValue(newDigits));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This is intentionally empty - we handle changes in handleInput
    // to have more control over the input behavior
    e.preventDefault();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Clean up display on blur
    if (digits === '' && !allowEmpty) {
      setDigits('');
      onChange(0);
    }
  };

  const handleClear = () => {
    setDigits('');
    onChange(allowEmpty ? undefined : 0);
    inputRef.current?.focus();
  };

  const displayValue = digitsToDisplay(digits);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold uppercase tracking-wide mb-2">
          {label} {required && '*'}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
          $
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={isFocused ? displayValue : (digits ? displayValue : '')}
          onChange={handleChange}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full pl-8 pr-10 py-3 border ${
            error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
          } bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 font-mono text-right ${className}`}
        />
        {digits && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Type digits to fill price from right (e.g., 2 → $0.02, 2000 → $20.00)
      </p>
    </div>
  );
}
