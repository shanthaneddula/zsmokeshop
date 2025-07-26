'use client';

import React from 'react';
import { AlertTriangle, Shield, Clock, Info } from 'lucide-react';

interface ComplianceNoteProps {
  complianceLevel?: 'none' | 'age-restricted' | 'regulated' | 'prescription';
  ageRestriction?: number;
  complianceNotes?: string[];
  safetyWarnings?: string[];
  legalDisclaimers?: string[];
  className?: string;
}

export default function ComplianceNote({
  complianceLevel = 'none',
  ageRestriction = 18,
  complianceNotes = [],
  safetyWarnings = [],
  legalDisclaimers = [],
  className = ''
}: ComplianceNoteProps) {
  // Don't render if no compliance requirements
  if (complianceLevel === 'none' && complianceNotes.length === 0 && safetyWarnings.length === 0 && legalDisclaimers.length === 0) {
    return null;
  }

  const getComplianceIcon = () => {
    switch (complianceLevel) {
      case 'prescription':
        return <Shield className="w-5 h-5" />;
      case 'regulated':
        return <AlertTriangle className="w-5 h-5" />;
      case 'age-restricted':
        return <Clock className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getComplianceColor = () => {
    switch (complianceLevel) {
      case 'prescription':
        return 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      case 'regulated':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200';
      case 'age-restricted':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200';
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
    }
  };

  const getComplianceTitle = () => {
    switch (complianceLevel) {
      case 'prescription':
        return 'Prescription Required';
      case 'regulated':
        return 'Regulated Product';
      case 'age-restricted':
        return `Age Restricted (${ageRestriction}+)`;
      default:
        return 'Important Information';
    }
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${getComplianceColor()} ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-2 mb-3">
        {getComplianceIcon()}
        <h3 className="font-bold uppercase tracking-wide text-sm">
          {getComplianceTitle()}
        </h3>
      </div>

      {/* Age Restriction Notice */}
      {complianceLevel !== 'none' && ageRestriction && (
        <div className="mb-3 p-3 bg-white/50 dark:bg-black/20 rounded border border-current/20">
          <p className="text-sm font-medium">
            <strong>Age Verification Required:</strong> You must be {ageRestriction} years or older to purchase this product.
          </p>
        </div>
      )}

      {/* Compliance Notes */}
      {complianceNotes.length > 0 && (
        <div className="mb-3">
          <h4 className="font-bold text-xs uppercase tracking-wide mb-2">Compliance Information</h4>
          <ul className="space-y-1">
            {complianceNotes.map((note, index) => (
              <li key={index} className="text-sm flex items-start">
                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Safety Warnings */}
      {safetyWarnings.length > 0 && (
        <div className="mb-3">
          <h4 className="font-bold text-xs uppercase tracking-wide mb-2 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Safety Warnings
          </h4>
          <ul className="space-y-1">
            {safetyWarnings.map((warning, index) => (
              <li key={index} className="text-sm flex items-start">
                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Legal Disclaimers */}
      {legalDisclaimers.length > 0 && (
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wide mb-2 flex items-center">
            <Shield className="w-3 h-3 mr-1" />
            Legal Disclaimers
          </h4>
          <ul className="space-y-1">
            {legalDisclaimers.map((disclaimer, index) => (
              <li key={index} className="text-sm flex items-start">
                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {disclaimer}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer Notice */}
      <div className="mt-4 pt-3 border-t border-current/20">
        <p className="text-xs opacity-75">
          By purchasing this product, you acknowledge that you meet all legal requirements and agree to use this product responsibly and in accordance with all applicable laws.
        </p>
      </div>
    </div>
  );
}
