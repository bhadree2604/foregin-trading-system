import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, getUserProfile, loginUser, registerUser, logoutUser } from '../services/auth';
import { getCompany } from '../firebase/companies';
import { ROLE_DASHBOARD_PATHS } from '../constants/roles';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);   // Session user { uid, email }
  const [userProfile, setUserProfile] = useState(null);   // MySQL users row
  const [userCompany, setUserCompany] = useState(null);   // MySQL companies row
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (sessionUser) => {
      setError(null);
      if (!sessionUser) {
        setCurrentUser(null);
        setUserProfile(null);
        setUserCompany(null);
        setLoading(false);
        return;
      }

      try {
        setCurrentUser(sessionUser);
        const profile = await getUserProfile(sessionUser.uid);
        setUserProfile(profile);

        if (profile?.companyId) {
          const company = await getCompany(profile.companyId);
          setUserCompany(company);
        }
      } catch (err) {
        console.error('Auth context error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setUserProfile(null);
    setUserCompany(null);
  };

  const login = async (email, password) => {
    const profile = await loginUser(email, password);
    setUserProfile(profile);
    if (profile?.companyId) {
      try {
        const company = await getCompany(profile.companyId);
        setUserCompany(company);
      } catch (_) {
        // company load failure should not block login
      }
    }
    return profile;
  };

  const register = async (formData) => {
    const result = await registerUser(formData);
    const profile = await getUserProfile(result.uid);
    if (profile) {
      setUserProfile(profile);
      if (profile?.companyId) {
        try {
          const company = await getCompany(profile.companyId);
          setUserCompany(company);
        } catch (_) {
          // ignore company load errors after registration
        }
      }
      return profile;
    }
    return result;
  };

  const refreshProfile = async () => {
    if (!currentUser) return;
    const profile = await getUserProfile(currentUser.uid);
    setUserProfile(profile);
    if (profile?.companyId) {
      const company = await getCompany(profile.companyId);
      setUserCompany(company);
    }
  };

  const value = {
    currentUser,
    userProfile,
    userCompany,
    userRole: userProfile?.role || null,
    loading,
    error,
    login,
    register,
    logout,
    refreshProfile,
    refreshUserProfile: refreshProfile,
    isAdmin: userProfile?.role === 'admin',
    isBuyer: userProfile?.role === 'buyer',
    isExporter: userProfile?.role === 'exporter',
    isLogistics: userProfile?.role === 'logistics',
    dashboardPath: userProfile ? ROLE_DASHBOARD_PATHS[userProfile.role] : '/',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
