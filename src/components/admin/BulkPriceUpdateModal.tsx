'use client';

import { useState } from 'react';
import { PriceInput } from './PriceInput';

export type PriceUpdateType = 
  | 'set-price'           // Set exact price
  | 'set-sale-price'      // Set exact sale price
  | 'increase-percent'    // Increase by percentage
  | 'decrease-percent'    // Decrease by percentage
  | 'increase-amount'     // Increase by fixed amount
  | 'decrease-amount'     // Decrease by fixed amount
  | 'remove-sale-price';  // Remove sale price

interface BulkPriceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (updateType: PriceUpdateType, value: number) => Promise<void>;
  selectedCount: number;
  isLoading?: boolean;
}

export function BulkPriceUpdateModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isLoading = false
}: BulkPriceUpdateModalProps) {
  const [updateType, setUpdateType] = useState<PriceUpdateType>('set-price');
  const [priceValue, setPriceValue] = useState<number | undefined>(undefined);
  const [percentValue, setPercentValue] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let value = 0;

    if (updateType === 'remove-sale-price') {
      // No value needed for removing sale price
      value = 0;
    } else if (updateType === 'increase-percent' || updateType === 'decrease-percent') {
      const percent = parseFloat(percentValue);
      if (isNaN(percent) || percent <= 0 || percent > 100) {
        setError('Please enter a valid percentage between 1 and 100');
        return;
      }
      value = percent;
    } else {
      if (!priceValue || priceValue <= 0) {
        setError('Please enter a valid price amount');
        return;
      }
      value = priceValue;
    }

    try {
      await onConfirm(updateType, value);
      // Reset form on success
      setPriceValue(undefined);
      setPercentValue('');
      setUpdateType('set-price');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update prices');
    }
  };

  const handleClose = () => {
    setPriceValue(undefined);
    setPercentValue('');
    setUpdateType('set-price');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const showPriceInput = ['set-price', 'set-sale-price', 'increase-amount', 'decrease-amount'].includes(updateType);
  const showPercentInput = ['increase-percent', 'decrease-percent'].includes(updateType);
  const showNoInput = updateType === 'remove-sale-price';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bulk Price Update</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update prices for {selectedCount} selected product{selectedCount !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Update Type Selection */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-3">
              Update Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="updateType"
                  value="set-price"
                  checked={updateType === 'set-price'}
                  onChange={() => setUpdateType('set-price')}
                  className="text-gray-900 dark:text-white"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Set Exact Price</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Set the same price for all selected products</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="updateType"
                  value="set-sale-price"
                  checked={updateType === 'set-sale-price'}
                  onChange={() => setUpdateType('set-sale-price')}
                  className="text-gray-900 dark:text-white"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Set Sale Price</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Set the same sale price for all selected products</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="updateType"
                  value="increase-percent"
                  checked={updateType === 'increase-percent'}
                  onChange={() => setUpdateType('increase-percent')}
                  className="text-gray-900 dark:text-white"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Increase by Percentage</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Increase current prices by a percentage</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="updateType"
                  value="decrease-percent"
                  checked={updateType === 'decrease-percent'}
                  onChange={() => setUpdateType('decrease-percent')}
                  className="text-gray-900 dark:text-white"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Decrease by Percentage</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Decrease current prices by a percentage</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="updateType"
                  value="increase-amount"
                  checked={updateType === 'increase-amount'}
                  onChange={() => setUpdateType('increase-amount')}
                  className="text-gray-900 dark:text-white"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Increase by Amount</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Add a fixed dollar amount to current prices</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="updateType"
                  value="decrease-amount"
                  checked={updateType === 'decrease-amount'}
                  onChange={() => setUpdateType('decrease-amount')}
                  className="text-gray-900 dark:text-white"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Decrease by Amount</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Subtract a fixed dollar amount from current prices</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="updateType"
                  value="remove-sale-price"
                  checked={updateType === 'remove-sale-price'}
                  onChange={() => setUpdateType('remove-sale-price')}
                  className="text-gray-900 dark:text-white"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Remove Sale Price</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Clear sale price from all selected products</div>
                </div>
              </label>
            </div>
          </div>

          {/* Value Input */}
          {showPriceInput && (
            <PriceInput
              label={updateType === 'set-price' ? 'New Price' : 
                     updateType === 'set-sale-price' ? 'New Sale Price' :
                     updateType === 'increase-amount' ? 'Amount to Add' : 'Amount to Subtract'}
              value={priceValue}
              onChange={setPriceValue}
              required
            />
          )}

          {showPercentInput && (
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                Percentage {updateType === 'increase-percent' ? 'to Add' : 'to Subtract'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={percentValue}
                  onChange={(e) => setPercentValue(e.target.value)}
                  placeholder="e.g., 10"
                  className="w-full px-4 py-3 pr-10 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                  %
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {updateType === 'increase-percent' 
                  ? 'E.g., 10% will change $20.00 to $22.00'
                  : 'E.g., 10% will change $20.00 to $18.00'}
              </p>
            </div>
          )}

          {showNoInput && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This will remove the sale price from all {selectedCount} selected product{selectedCount !== 1 ? 's' : ''}.
                The regular price will remain unchanged.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold uppercase tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 rounded flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </>
              ) : (
                `Update ${selectedCount} Product${selectedCount !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
