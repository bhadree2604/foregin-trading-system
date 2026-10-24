/** Companies client — MySQL backed. */
import { apiFetch } from '../lib/session';

export async function getCompany(companyId) {
  if (!companyId) return null;
  try {
    const data = await apiFetch(`/api/companies?id=${encodeURIComponent(companyId)}`);
    return data.company;
  } catch (_) {
    return null;
  }
}

export async function updateCompany(companyId, data) {
  await apiFetch('/api/companies', { method: 'PATCH', body: JSON.stringify({ companyId, data }) });
}

export async function getCompaniesByStatus(verificationStatus) {
  const data = await apiFetch(`/api/companies?status=${encodeURIComponent(verificationStatus)}`);
  return data.companies || [];
}

export async function getAllCompanies() {
  const data = await apiFetch('/api/companies');
  return data.companies || [];
}

export async function approveCompany(companyId, adminId) {
  await apiFetch('/api/companies', { method: 'PATCH', body: JSON.stringify({ companyId, action: 'approve', adminId }) });
}

export async function rejectCompany(companyId, adminId, reason) {
  await apiFetch('/api/companies', { method: 'PATCH', body: JSON.stringify({ companyId, action: 'reject', adminId, reason }) });
}

export async function suspendCompany(companyId, adminId, reason) {
  await apiFetch('/api/companies', { method: 'PATCH', body: JSON.stringify({ companyId, action: 'suspend', adminId, reason }) });
}
