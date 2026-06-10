 

const COMPANY_TYPE_LABELS = {
  company: {
    displayName: 'Hiring Company',
    pageHeading: 'Post a Job',
    editHeading: 'Edit Job',
    titleLabel: 'Job Title',
    titlePlaceholder: 'e.g. Senior Product Designer',
    salaryLabel: 'Salary Range',
    salaryPlaceholder: 'e.g. $100k - $120k',
    descriptionLabel: 'Job Description',
    descriptionPlaceholder: 'Write detailed job description...',
    locationLabel: 'Location',
    locationPlaceholder: 'e.g. New York, Remote',
    applyButtonText: 'Apply',
    aboutSectionTitle: 'About The Job',
    detailSalaryLabel: 'Salary',
    detailLocationLabel: 'Location',
  },
  startup: {
    displayName: 'Startup / Idea',
    pageHeading: 'Post Your Startup',
    editHeading: 'Edit Startup',
    titleLabel: 'Startup Name',
    titlePlaceholder: 'e.g. EcoTrack — Sustainability Platform',
    salaryLabel: 'Funding Stage',
    salaryPlaceholder: 'e.g. Seed, Pre-Series A',
    descriptionLabel: 'Pitch (problem you solve)',
    descriptionPlaceholder: 'Describe the problem you solve and your vision...',
    locationLabel: 'HQ City',
    locationPlaceholder: 'e.g. Bangalore, Mumbai',
    applyButtonText: 'Apply',
    aboutSectionTitle: 'About The Startup',
    detailSalaryLabel: 'Funding Stage',
    detailLocationLabel: 'HQ City',
  },
  investor: {
    displayName: 'Investor / VC',
    pageHeading: 'Post Your Fund',
    editHeading: 'Edit Fund',
    titleLabel: 'Fund / Firm Name',
    titlePlaceholder: 'e.g. Sequoia Capital India',
    salaryLabel: 'Ticket Size',
    salaryPlaceholder: 'e.g. ₹10L – ₹2Cr',
    descriptionLabel: 'Investment Thesis (what you fund)',
    descriptionPlaceholder: 'Describe what sectors/stages you invest in...',
    locationLabel: 'Office City',
    locationPlaceholder: 'e.g. Delhi, Bangalore',
    applyButtonText: 'Connect with Founder',
    aboutSectionTitle: 'About The Fund',
    detailSalaryLabel: 'Ticket Size',
    detailLocationLabel: 'Office City',
  },
};

/**
 * Returns the labels for the given companyType, falling back to 'company'.
 */
export const getCompanyTypeLabels = (companyType) => {
  return COMPANY_TYPE_LABELS[companyType] || COMPANY_TYPE_LABELS.company;
};

/**
 * Dropdown options for the company type selector.
 */
export const COMPANY_TYPE_OPTIONS = [
  { value: 'company', label: 'Hiring Company' },
  { value: 'startup', label: 'Startup / Idea' },
  { value: 'investor', label: 'Investor / VC' },
];

export default COMPANY_TYPE_LABELS;
