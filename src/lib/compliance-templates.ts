import { ComplianceTemplate } from '@/types';

/**
 * Predefined compliance templates for different product categories
 * Used to automatically populate compliance information based on product type
 */
export const COMPLIANCE_TEMPLATES: ComplianceTemplate[] = [
  {
    id: 'tobacco-vaporizer',
    name: 'Tobacco / Nicotine / E-Cigarette Products',
    category: 'high-end-vaporizers',
    level: 'age-restricted',
    ageRestriction: 21,
    description: 'For tobacco, nicotine and e-cigarette products (Texas: 21+, retailer permit required)',
    defaultNotes: [
      'Sold only to adults 21 years of age or older. Valid photo ID required.',
      'Sold in store only. No online sales or delivery.',
      'Keep out of reach of children and pets.'
    ],
    defaultWarnings: [
      'WARNING: This product contains nicotine. Nicotine is an addictive chemical.'
    ],
    defaultDisclaimers: [
      'Not for sale to persons under 21.',
      'No claim is made that this product is safer or less harmful than other tobacco products.'
    ]
  },
  {
    id: 'cbd-thc-free',
    name: 'THC-Free Hemp CBD Products',
    category: 'cbd-and-hemp',
    level: 'age-restricted',
    ageRestriction: 21,
    description: 'For THC-free (broad spectrum or isolate) hemp CBD products only. Do not use for any product containing THC.',
    defaultNotes: [
      'THC-free: no detectable THC per the manufacturer certificate of analysis.',
      'Sold only to adults 21 years of age or older.',
      'Sold in store only. No online sales or delivery.'
    ],
    defaultWarnings: [
      'Keep out of reach of children and pets.',
      'Consult a healthcare professional before use if pregnant, nursing or taking medication.'
    ],
    defaultDisclaimers: [
      'These statements have not been evaluated by the Food and Drug Administration.',
      'This product is not intended to diagnose, treat, cure, or prevent any disease.',
      '21+ only.'
    ]
  },
  {
    id: 'smoking-accessories',
    name: 'Smoking Accessories (glass, grinders, papers)',
    category: 'general',
    level: 'age-restricted',
    ageRestriction: 21,
    description: 'For water pipes, hand pipes, grinders, papers and similar accessories',
    defaultNotes: [
      'For use with legal tobacco and legal botanical products only.',
      'Sold only to adults 21 years of age or older.'
    ],
    defaultWarnings: [
      'Keep out of reach of children.'
    ],
    defaultDisclaimers: [
      'Not intended for use with any illegal substance.',
      'Sold in store only. No online sales or delivery.'
    ]
  },
  {
    id: 'general-age-restricted',
    name: 'General Age-Restricted Products',
    category: 'general',
    level: 'age-restricted',
    ageRestriction: 21,
    description: 'For general products requiring age verification',
    defaultNotes: [
      'Must be 21 years or older to purchase.',
      'Valid ID required for verification.',
      'Not for use by minors.',
      'Keep out of reach of children.'
    ],
    defaultWarnings: [
      'WARNING: Not for use by minors.',
      'WARNING: Follow all manufacturer instructions.'
    ],
    defaultDisclaimers: [
      'For adult use only.',
      'Comply with all local laws and regulations.'
    ]
  }
];

/**
 * Get compliance template by ID
 */
export function getComplianceTemplate(templateId: string): ComplianceTemplate | null {
  return COMPLIANCE_TEMPLATES.find(template => template.id === templateId) || null;
}

/**
 * Get compliance templates by category
 */
export function getComplianceTemplatesByCategory(category: string): ComplianceTemplate[] {
  return COMPLIANCE_TEMPLATES.filter(template => 
    template.category === category || template.category === 'general'
  );
}

/**
 * Get all available compliance templates
 */
export function getAllComplianceTemplates(): ComplianceTemplate[] {
  return COMPLIANCE_TEMPLATES;
}

/**
 * Validate compliance data for a product
 */
export function validateCompliance(
  complianceLevel: string,
  templateId?: string,
  customNotes?: string[]
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if compliance level requires a template
  if (complianceLevel !== 'none' && !templateId) {
    errors.push('Compliance template is required for regulated products');
  }

  // Check if template exists
  if (templateId && !getComplianceTemplate(templateId)) {
    errors.push('Invalid compliance template selected');
  }

  // Validate custom notes
  if (customNotes && customNotes.some(note => note.trim().length === 0)) {
    warnings.push('Empty compliance notes should be removed');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Apply compliance template to product data
 */
export function applyComplianceTemplate(
  templateId: string,
  existingData?: Partial<{
    complianceNotes: string[];
    safetyWarnings: string[];
    legalDisclaimers: string[];
    ageRestriction: number;
  }>
): Partial<{
  complianceNotes: string[];
  safetyWarnings: string[];
  legalDisclaimers: string[];
  ageRestriction: number;
  complianceLevel: 'none' | 'age-restricted' | 'regulated' | 'prescription';
}> {
  const template = getComplianceTemplate(templateId);
  
  if (!template) {
    return existingData || {};
  }

  return {
    complianceLevel: template.level as 'none' | 'age-restricted' | 'regulated' | 'prescription',
    complianceNotes: [...template.defaultNotes, ...(existingData?.complianceNotes || [])],
    safetyWarnings: [...template.defaultWarnings, ...(existingData?.safetyWarnings || [])],
    legalDisclaimers: [...template.defaultDisclaimers, ...(existingData?.legalDisclaimers || [])],
    ageRestriction: template.ageRestriction
  };
}
