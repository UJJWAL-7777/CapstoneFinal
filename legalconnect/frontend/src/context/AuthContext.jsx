import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { TOKEN_KEY } from '../services/api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  const clear = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setProfile(null);
  }, []);

  const applySession = useCallback(({ user: u, profile: p, token }) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    setUser(u);
    setProfile(p ?? null);
    return u;
  }, []);

  // Restore session on first load
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authService.me()
      .then((data) => { setUser(data.user); setProfile(data.profile); })
      .catch(clear)
      .finally(() => setLoading(false));
  }, [clear]);

  // The axios interceptor fires this when the server rejects the token
  useEffect(() => {
    const onExpired = () => { setUser(null); setProfile(null); };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = useCallback(async (credentials) => applySession(await authService.login(credentials)), [applySession]);
  const register = useCallback(async (payload) => applySession(await authService.register(payload)), [applySession]);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* token may already be invalid; sign out locally anyway */ }
    clear();
  }, [clear]);

  const refetchUser = useCallback(async () => {
    try {
      const data = await authService.me();
      setUser(data.user);
      setProfile(data.profile);
    } catch { /* silent */ }
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, isAuthenticated: Boolean(user), login, register, logout, refetchUser }),
    [user, profile, loading, login, register, logout, refetchUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
