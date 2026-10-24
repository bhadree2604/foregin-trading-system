// Application roles - centralized definition
export const ROLES = {
  ADMIN: 'admin',
  BUYER: 'buyer',
  EXPORTER: 'exporter',
  LOGISTICS: 'logistics',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.BUYER]: 'Buyer / Importer',
  [ROLES.EXPORTER]: 'Exporter / Seller',
  [ROLES.LOGISTICS]: 'Logistics Provider',
};

// Roles users can self-register as (admin is excluded)
export const REGISTERABLE_ROLES = [
  { value: ROLES.BUYER, label: 'Importer / Buyer' },
  { value: ROLES.EXPORTER, label: 'Exporter / Seller' },
  { value: ROLES.LOGISTICS, label: 'Logistics Provider' },
];

export const COMPANY_TYPES = {
  IMPORTER: 'importer',
  EXPORTER: 'exporter',
  LOGISTICS: 'logistics',
};

export const ROLE_DASHBOARD_PATHS = {
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.BUYER]: '/buyer/dashboard',
  [ROLES.EXPORTER]: '/exporter/dashboard',
  [ROLES.LOGISTICS]: '/logistics/dashboard',
};
