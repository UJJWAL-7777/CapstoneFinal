import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell.jsx';
import Field from '../../components/ui/Field.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import { parseApiError } from '../../services/api.js';
import { validateLogin } from '../../utils/validators.js';
import { ROLE_HOME } from '../../utils/constants.js';
import { authService } from '../../services/authService.js';
import { TOKEN_KEY } from '../../services/api.js';

// Demo accounts for one-click testing
const DEMO_ACCOUNTS = [
  {
    label: 'Admin',
    email: 'admin@legalconnect.local',
    password: 'Admin@123456',
    color: 'bg-chamber-800 hover:bg-chamber-900 text-white',
  },
  {
    label: 'Client',
    email: 'rahul.mehta@demo.lc',
    password: 'Demo@12345',
    color: 'bg-brass-500 hover:bg-brass-600 text-white',
  },
  {
    label: 'Advocate',
    email: 'priya.sharma@demo.lc',
    password: 'Demo@12345',
    color: 'bg-chamber-500 hover:bg-chamber-600 text-white',
  },
];

export default function Login() {
  const { login, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState('');

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const performLogin = async (email, password) => {
    setFormError('');
    setErrors({});
    // Directly call authService + store token ourselves — bypasses GuestRoute issue
    const data = await authService.login({ email: email.trim(), password });
    if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validateLogin(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const data = await performLogin(values.email, values.password);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      // Hard navigate to bypass stale auth state
      window.location.href = ROLE_HOME[data.user.role];
    } catch (err) {
      const { message, fieldErrors } = parseApiError(err);
      setErrors(fieldErrors);
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const onDemoLogin = async (account) => {
    if (demoLoading) return;
    setDemoLoading(account.label);
    setFormError('');
    setErrors({});
    try {
      // Clear any existing session first
      try { await logout(); } catch { /* ignore */ }
      localStorage.removeItem(TOKEN_KEY);

      // Login as demo user
      const data = await performLogin(account.email, account.password);
      toast.success(`Signed in as ${account.label}: ${data.user.name.split(' ')[0]}`);
      // Hard navigate so AuthContext rehydrates fresh
      window.location.href = ROLE_HOME[data.user.role];
    } catch (err) {
      const { message } = parseApiError(err);
      setFormError(message || `Could not sign in as ${account.label}`);
    } finally {
      setDemoLoading('');
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Pick up your consultations and cases where you left them."
      footer={<>New to LegalConnect? <Link to="/register" className="font-medium text-chamber-700 underline underline-offset-2">Create an account</Link></>}
    >
      {/* ── Demo quick-login ─────────────────────────────────── */}
      <div className="rounded-xl border border-line bg-paper p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Demo — sign in as
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.label}
              type="button"
              disabled={!!demoLoading}
              onClick={() => onDemoLogin(acc)}
              className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${acc.color} disabled:opacity-60 flex items-center justify-center gap-1.5`}
            >
              {demoLoading === acc.label ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white inline-block" />
              ) : null}
              {demoLoading === acc.label ? 'Signing in…' : acc.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-ink-muted text-center">
          One click to explore each role with sample data
        </p>
      </div>

      <div className="flex items-center gap-3 my-1">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs text-ink-muted">or sign in manually</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      {/* ── Manual login form ────────────────────────────────── */}
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && <Alert tone="error">{formError}</Alert>}
        <Field
          label="Email" type="email" id="login-email"
          autoComplete="email"
          value={values.email} onChange={set('email')} error={errors.email}
        />
        <Field
          label="Password" type="password" id="login-password"
          autoComplete="current-password"
          value={values.password} onChange={set('password')} error={errors.password}
        />
        <Button type="submit" loading={submitting} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
