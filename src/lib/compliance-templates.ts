import { ComplianceTemplate } from '@/types';

/**
 * Predefined compliance templates for different product categories
 * Used to automatically populate compliance information based on product type
 */
export const COMPLIANCE_TEMPLATES: ComplianceTemplate[] = [
  {
    id: 'tobacco-vaporizer',
    name: 'Tobacco/Vaporizer Products',
    category: 'high-end-vaporizers',
    level: 'age-restricted',
    ageRestriction: 21,
    description: 'For tobacco and vaping products requiring age verification',
    defaultNotes: [
      'This product is intended for use by adults 21 years of age or older.',
      'This product has not been evaluated by the FDA.',
      'Keep out of reach of children and pets.',
      'Not for use by pregnant or nursing women.',
      'Consult your physician before use if you have medical conditions.'
    ],
    defaultWarnings: [
      'WARNING: This product contains nicotine. Nicotine is an addictive chemical.',
      'WARNING: Not for use by minors, pregnant or nursing women.',
      'WARNING: May cause dizziness, nausea, or other adverse effects.',
      'WARNING: Do not use if you have heart conditions or high blood pressure.',
      'WARNING: Keep away from children and pets at all times.'
    ],
    defaultDisclaimers: [
      'For tobacco use only.',
      'Use only as directed by manufacturer.',
      'Discontinue use if adverse reactions occur.',
      'This product has not been evaluated by the FDA for safety or efficacy.',
      'Individual results may vary.'
    ]
  },
  {
    id: 'nitrous-oxide',
    name: 'Nitrous Oxide Products',
    category: 'whipped-cream-chargers-nitrous-oxide',
    level: 'regulated',
    ageRestriction: 18,
    description: 'For nitrous oxide products with food service restrictions',
    defaultNotes: [
      'Food-grade nitrous oxide for culinary use only.',
      'Intended for whipped cream dispensers and culinary applications.',
      'Not for inhalation or recreational use.',
      'Must be 18 years or older to purchase.',
      'Professional food service equipment recommended.'
    ],
    defaultWarnings: [
      'WARNING: Misuse can cause serious injury or death.',
      'WARNING: Do not inhale directly from container.',
      'WARNING: Use only in well-ventilated areas.',
      'WARNING: Store in cool, dry place away from heat sources.',
      'WARNING: Do not puncture, crush, or expose to temperatures above 120°F.',
      'WARNING: Oxygen deprivation can occur with misuse.'
    ],
    defaultDisclaimers: [
      'For food service and culinary use only.',
      'Seller is not responsible for misuse of this product.',
      'By purchasing, you confirm you are 18+ and understand proper use.',
      'Not intended for human consumption or inhalation.',
      'Comply with all local, state, and federal regulations.'
    ]
  },
  {
    id: 'thc-a-products',
    name: 'THC-A Products',
    category: 'thc-a',
    level: 'regulated',
    ageRestriction: 21,
    description: 'For THC-A products with legal status considerations',
    defaultNotes: [
      'THC-A products are legal under federal law when derived from hemp.',
      'Must be 21 years or older to purchase.',
      'May convert to Delta-9 THC when heated.',
      'Not for use by pregnant or nursing women.',
      'Keep out of reach of children and pets.'
    ],
    defaultWarnings: [
      'WARNING: May cause psychoactive effects when heated.',
      'WARNING: Do not drive or operate machinery after use.',
      'WARNING: May show positive on drug tests.',
      'WARNING: Start with small amounts to assess tolerance.',
      'WARNING: Not for use by minors, pregnant or nursing women.'
    ],
    defaultDisclaimers: [
      'This product has not been evaluated by the FDA.',
      'Not for use in states where prohibited.',
      'User is responsible for knowing local laws.',
      'May cause positive drug test results.',
      'For adult use only in compliance with state laws.'
    ]
  },
  {
    id: 'kratom-products',
    name: 'Kratom Products',
    category: 'kratoms',
    level: 'regulated',
    ageRestriction: 18,
    description: 'For kratom products with research use restrictions',
    defaultNotes: [
      'Kratom is sold for research purposes only.',
      'Not for human consumption.',
      'Must be 18 years or older to purchase.',
      'Not evaluated by the FDA for safety or efficacy.',
      'Keep out of reach of children and pets.'
    ],
    defaultWarnings: [
      'WARNING: Not for human consumption.',
      'WARNING: For research and educational purposes only.',
      'WARNING: May be habit-forming if misused.',
      'WARNING: Not for use by pregnant or nursing women.',
      'WARNING: Consult healthcare provider before any use.'
    ],
    defaultDisclaimers: [
      'Sold for research purposes only.',
      'Not intended for human consumption.',
      'This product has not been evaluated by the FDA.',
      'User assumes all responsibility for use.',
      'Comply with all applicable laws and regulations.'
    ]
  },
  {
    id: 'seven-hydroxy',
    name: '7-Hydroxy Products',
    category: '7-hydroxy',
    level: 'regulated',
    ageRestriction: 21,
    description: 'For 7-Hydroxy products with lab testing requirements',
    defaultNotes: [
      '7-Hydroxy products are third-party lab tested.',
      'Must be 21 years or older to purchase.',
      'Derived from legal hemp sources.',
      'Not for use by pregnant or nursing women.',
      'Keep out of reach of children and pets.'
    ],
    defaultWarnings: [
      'WARNING: May cause psychoactive effects.',
      'WARNING: Do not drive or operate machinery after use.',
      'WARNING: May show positive on drug tests.',
      'WARNING: Start with small doses to assess tolerance.',
      'WARNING: Not for use by minors, pregnant or nursing women.'
    ],
    defaultDisclaimers: [
      'This product has not been evaluated by the FDA.',
      'Lab tested for potency and purity.',
      'Not for use in states where prohibited.',
      'User is responsible for knowing local laws.',
      'For adult use only in compliance with state laws.'
    ]
  },
  {
    id: 'general-age-restricted',
    name: 'General Age-Restricted Products',
    category: 'general',
    level: 'age-restricted',
    ageRestriction: 18,
    description: 'For general products requiring age verification',
    defaultNotes: [
      'Must be 18 years or older to purchase.',
      'Valid ID required for verification.',
      'Not for use by minors.',
      'Keep out of reach of children.',
      'Use only as intended by manufacturer.'
    ],
    defaultWarnings: [
      'WARNING: Not for use by minors.',
      'WARNING: Adult supervision required.',
      'WARNING: Follow all manufacturer instructions.',
      'WARNING: Discontinue use if adverse effects occur.'
    ],
    defaultDisclaimers: [
      'For adult use only.',
      'User assumes responsibility for proper use.',
      'Comply with all local laws and regulations.',
      'Seller not responsible for misuse.'
    ]
  },
  {
    id: 'cannabis-products',
    name: 'Cannabis & Hemp-Derived Products',
    category: 'cannabis-products',
    level: 'regulated',
    ageRestriction: 21,
    description: 'For cannabis, hemp-derived, and THC-A products',
    defaultNotes: [
      'Must be 21 years or older to purchase.',
      'Valid government-issued ID required for verification.',
      'Farm Bill compliant hemp-derived products.',
      'Contains less than 0.3% Delta-9 THC by dry weight.',
      'Lab-tested for potency and purity.',
      'Keep out of reach of children and pets.',
      'Do not drive or operate machinery after use.',
      'Start with low doses and wait for effects before consuming more.',
      'Store in a cool, dry place away from direct sunlight.'
    ],
    defaultWarnings: [
      'WARNING: This product has not been evaluated by the FDA.',
      'WARNING: May cause drowsiness, dizziness, or impairment.',
      'WARNING: Do not use if pregnant, nursing, or under 21.',
      'WARNING: Keep away from children and pets.',
      'WARNING: Do not drive or operate machinery after use.',
      'WARNING: May cause dry mouth, red eyes, or increased appetite.',
      'WARNING: Effects may be delayed - wait at least 2 hours before consuming more.',
      'WARNING: Use responsibly and in accordance with state laws.'
    ],
    defaultDisclaimers: [
      'This product has not been evaluated by the Food and Drug Administration.',
      'This product is not intended to diagnose, treat, cure, or prevent any disease.',
      'For adult use only - must be 21 years or older.',
      'Keep out of reach of children and pets.',
      'Use only as directed and do not exceed recommended dosage.',
      'Individual results may vary.',
      'Consult your physician before use if you have medical conditions.',
      'Do not use if pregnant, nursing, or planning to become pregnant.',
      'User assumes all responsibility for proper use and compliance with local laws.',
      'Seller is not responsible for misuse or adverse effects.',
      'Products have not been tested or approved by any government agency.',
      'Legal only in states where hemp-derived products are permitted.'
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
