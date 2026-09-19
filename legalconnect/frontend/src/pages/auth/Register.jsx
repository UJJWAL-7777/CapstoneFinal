import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell.jsx';
import Field from '../../components/ui/Field.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import { parseApiError } from '../../services/api.js';
import { validateRegister } from '../../utils/validators.js';
import { PRACTICE_AREAS, ROLE_HOME } from '../../utils/constants.js';

const INITIAL = {
  role: 'client', name: '', email: '', phone: '', password: '',
  barCouncilNumber: '', barCouncilState: '', city: '', state: '',
  experienceYears: '', practiceAreas: [], languages: '', consultationFee: '',
};

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdvocate = values.role === 'advocate';
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));
  const togglePractice = (area) =>
    setValues((v) => ({
      ...v,
      practiceAreas: v.practiceAreas.includes(area) ? v.practiceAreas.filter((a) => a !== area) : [...v.practiceAreas, area],
    }));

  const buildPayload = () => {
    const base = { role: values.role, name: values.name.trim(), email: values.email.trim(), password: values.password };
    if (values.phone.trim()) base.phone = values.phone.trim();
    if (!isAdvocate) return base;
    return {
      ...base,
      barCouncilNumber: values.barCouncilNumber.trim(),
      barCouncilState: values.barCouncilState.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      experienceYears: Number(values.experienceYears),
      practiceAreas: values.practiceAreas,
      languages: values.languages.split(',').map((l) => l.trim()).filter(Boolean),
      consultationFee: values.consultationFee === '' ? 0 : Number(values.consultationFee),
    };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const found = validateRegister(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const user = await register(buildPayload());
      toast.success(isAdvocate ? 'Account created. Your profile is pending verification.' : 'Account created. Welcome to LegalConnect.');
      navigate(ROLE_HOME[user.role], { replace: true });
    } catch (err) {
      const { message, fieldErrors } = parseApiError(err);
      setErrors(fieldErrors);
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      wide
      title="Create your account"
      subtitle="Clients find and consult advocates. Advocates manage consultations and cases."
      footer={<>Already registered? <Link to="/login" className="font-medium text-chamber-700 underline underline-offset-2">Sign in</Link></>}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">I am registering as</legend>
          <div className="grid grid-cols-2 gap-2 rounded-md bg-chamber-50 p-1">
            {[['client', 'A client'], ['advocate', 'An advocate']].map(([role, label]) => (
              <label key={role} className={`cursor-pointer rounded px-3 py-2 text-center text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-chamber-500 ${values.role === role ? 'bg-white text-chamber-800 shadow-sm' : 'text-ink-soft'}`}>
                <input type="radio" name="role" value={role} checked={values.role === role} onChange={set('role')} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {formError && <Alert tone="error">{formError}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" autoComplete="name" value={values.name} onChange={set('name')} error={errors.name} className="sm:col-span-2" />
          <Field label="Email" type="email" autoComplete="email" value={values.email} onChange={set('email')} error={errors.email} />
          <Field label="Phone (optional)" type="tel" autoComplete="tel" value={values.phone} onChange={set('phone')} error={errors.phone} />
          <Field
            label="Password" type="password" autoComplete="new-password" value={values.password} onChange={set('password')} error={errors.password}
            hint="At least 8 characters with upper and lower case letters and a number." className="sm:col-span-2"
          />
        </div>

        {isAdvocate && (
          <div className="space-y-4 border-t border-line pt-5">
            <div>
              <h2 className="text-lg">Professional details</h2>
              <p className="mt-1 text-sm text-ink-soft">Your enrolment details are reviewed by our team before your profile is marked as verified.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Bar Council enrolment number" value={values.barCouncilNumber} onChange={set('barCouncilNumber')} error={errors.barCouncilNumber} />
              <Field label="Bar Council state" value={values.barCouncilState} onChange={set('barCouncilState')} error={errors.barCouncilState} />
              <Field label="City" value={values.city} onChange={set('city')} error={errors.city} />
              <Field label="State" value={values.state} onChange={set('state')} error={errors.state} />
              <Field label="Years of experience" type="number" min="0" max="70" value={values.experienceYears} onChange={set('experienceYears')} error={errors.experienceYears} />
              <Field label="Consultation fee (INR, optional)" type="number" min="0" value={values.consultationFee} onChange={set('consultationFee')} error={errors.consultationFee} />
              <Field label="Languages (optional)" value={values.languages} onChange={set('languages')} hint="Separate with commas, for example: English, Hindi, Punjabi" className="sm:col-span-2" />
            </div>
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium">Practice areas</legend>
              <div className="flex flex-wrap gap-2">
                {PRACTICE_AREAS.map((area) => {
                  const on = values.practiceAreas.includes(area);
                  return (
                    <label key={area} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-chamber-500 ${on ? 'border-chamber-600 bg-chamber-700 text-white' : 'border-line bg-white text-ink-soft hover:border-chamber-300'}`}>
                      <input type="checkbox" checked={on} onChange={() => togglePractice(area)} className="sr-only" />
                      {area}
                    </label>
                  );
                })}
              </div>
              {errors.practiceAreas && <p className="mt-1.5 text-sm text-danger-700">{errors.practiceAreas}</p>}
            </fieldset>
          </div>
        )}

        <Button type="submit" loading={submitting} className="w-full">Create account</Button>
      </form>
    </AuthShell>
  );
}
