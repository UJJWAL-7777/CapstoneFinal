import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Video, MessageSquare, Users, IndianRupee,
  AlertCircle, CheckCircle2, ShieldCheck, CreditCard, QrCode,
  Sparkles, ChevronRight, FileText, ArrowLeft,
} from 'lucide-react';
import { advocateService } from '../../services/advocateService.js';
import { consultationService } from '../../services/consultationService.js';
import { usePlatformStatus } from '../../context/PlatformContext.jsx';
import MaintenanceNotice from '../../components/ui/MaintenanceNotice.jsx';
import { paymentService } from '../../services/paymentService.js';
import { aiService } from '../../services/aiService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { PRACTICE_AREAS } from '../../utils/constants.js';
import { format, addDays } from 'date-fns';

const MODES = [
  { value: 'video', label: 'Video Call', desc: 'Secure HD WebRTC call', icon: Video },
  { value: 'chat', label: 'Legal Chat', desc: 'Real-time text & document review', icon: MessageSquare },
  { value: 'in-person', label: 'In-Person', desc: 'Chamber / office consultation', icon: Users },
];

const DURATIONS = [
  { value: 30, label: '30 mins', desc: 'Quick advisory' },
  { value: 60, label: '60 mins', desc: 'Standard consultation' },
  { value: 90, label: '90 mins', desc: 'In-depth case study' },
];

const ISSUE_TEMPLATES = [
  { label: 'Property Dispute', area: 'Property Law', text: 'I need legal advice regarding a property boundary / title dispute and ancestral property ownership documentation.' },
  { label: 'Contract Review', area: 'Corporate Law', text: 'Review of an agreement / contract terms, liability clauses, and legal obligations before signing.' },
  { label: 'Family / Divorce', area: 'Family Law', text: 'Legal consultation regarding mutual divorce proceedings, child custody terms, and maintenance calculation.' },
  { label: 'Employment Issue', area: 'Labor Law', text: 'Advice on wrongful termination, severance pay settlement, and non-compete clause compliance.' },
  { label: 'Criminal Defense', area: 'Criminal Law', text: 'Urgent legal consultation on police notice, anticipatory bail procedure, and defense roadmap.' },
  { label: 'Consumer Complaint', area: 'Consumer Protection', text: 'Filing a formal consumer forum complaint for defective service / product and seeking compensation.' },
];

export default function BookConsultation() {
  const { advocateId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { maintenanceMode, isAdmin, supportEmail } = usePlatformStatus();
  const [advocate, setAdvocate] = useState(null);
  const [advocateLoading, setAdvocateLoading] = useState(true);
  const [advocateError, setAdvocateError] = useState(false);
  const [availabilityData, setAvailabilityData] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=details, 2=slot, 3=payment, 4=done
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  const [form, setForm] = useState({
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    timeSlot: '',
    duration: 60,
    mode: 'video',
    legalIssue: '',
    practiceArea: '',
  });
  const [consultation, setConsultation] = useState(null);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    if (maintenanceMode && !isAdmin) {
      setAdvocateLoading(false);
      return;
    }
    setAdvocateLoading(true);
    setAdvocateError(false);
    advocateService
      .getProfile(advocateId)
      .then((d) => {
        setAdvocate(d);
        if (d?.profile?.practiceAreas?.length > 0 && !form.practiceArea) {
          setForm((prev) => ({ ...prev, practiceArea: d.profile.practiceAreas[0] }));
        }
      })
      .catch(() => {
        setAdvocateError(true);
        toast.error('Failed to load advocate profile');
      })
      .finally(() => {
        setAdvocateLoading(false);
      });
  }, [advocateId, maintenanceMode, isAdmin]);

  useEffect(() => {
    if (form.date && advocateId) {
      setSlotsLoading(true);
      advocateService.getAvailability(advocateId, form.date)
        .then((data) => {
          setAvailabilityData(data);
          // If the current slot is not available in the new date, reset it
          if (form.timeSlot) {
            const isStillAvailable = data?.slots?.some((s) => s.startTime === form.timeSlot && !s.isBooked);
            if (!isStillAvailable) update('timeSlot', '');
          }
        })
        .catch(() => setAvailabilityData(null))
        .finally(() => setSlotsLoading(false));
    }
  }, [advocateId, form.date]);

  // AI analysis when issue text changes
  useEffect(() => {
    if (form.legalIssue.length < 25) return;
    const t = setTimeout(async () => {
      try {
        const result = await aiService.assist(form.legalIssue);
        setAiResult(result);
        if (result.practiceArea && !form.practiceArea) {
          setForm((p) => ({ ...p, practiceArea: result.practiceArea }));
        }
      } catch { /* silent */ }
    }, 900);
    return () => clearTimeout(t);
  }, [form.legalIssue]);

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const applyTemplate = (tpl) => {
    setForm((p) => ({
      ...p,
      legalIssue: tpl.text,
      practiceArea: tpl.area,
    }));
  };

  const handleBook = async () => {
    if (!form.timeSlot) {
      toast.error('Please select a time slot');
      return;
    }
    setLoading(true);
    try {
      const data = await consultationService.create({ advocateId, ...form });
      setConsultation(data.consultation);
      setPayment(data.payment);
      setStep(3);
    } catch (e) {
      toast.error(e.response?.data?.error?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      await paymentService.confirm(payment._id);
      setStep(4);
      toast.success('Payment verified! Your consultation is scheduled.');
    } catch {
      toast.error('Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  // 1. If maintenance mode is active for non-admins, show the dedicated service unavailable screen
  if (maintenanceMode && !isAdmin) {
    return (
      <MaintenanceNotice
        serviceName="Consultation Booking"
        description="LegalConnect is currently undergoing scheduled platform upgrades and maintenance. New consultation bookings, appointment slot scheduling, and escrow payments are temporarily paused to protect user transactions."
        backTo="/client/advocates"
        backLabel="Back to Advocate Directory"
      />
    );
  }

  // 2. If advocate is still loading
  if (advocateLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-chamber-200 border-t-chamber-600" />
        <p className="text-sm text-ink-muted">Loading advocate consultation details...</p>
      </div>
    );
  }

  // 3. If advocate failed to load or does not exist
  if (!advocate || advocateError) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full panel p-8 text-center space-y-4 shadow-sm border-line">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-ink">Advocate Profile Not Found</h2>
          <p className="text-xs text-ink-muted">
            The requested advocate profile is unavailable or no longer listed on the platform.
          </p>
          <Button onClick={() => navigate('/client/advocates')} className="gap-2 mx-auto">
            <ArrowLeft className="h-4 w-4" /> Back to Advocates
          </Button>
        </div>
      </div>
    );
  }

  const { user: adv, profile } = advocate;
  const availableSlots = availabilityData?.slots || [];
  const activeModes = MODES.filter(
    (m) => !profile?.consultationModes?.length || profile.consultationModes.includes(m.value)
  );

  const morningSlots = availableSlots.filter((s) => {
    const hour = parseInt(s.startTime.split(':')[0], 10);
    return hour < 13;
  });

  const afternoonSlots = availableSlots.filter((s) => {
    const hour = parseInt(s.startTime.split(':')[0], 10);
    return hour >= 13;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Book Consultation</h1>
          <p className="text-ink-soft text-sm mt-0.5">Direct scheduling with verified advocate</p>
        </div>
        <button
          onClick={() => navigate(`/client/advocates/${adv?._id || advocateId}`)}
          className="text-xs text-chamber-700 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Profile
        </button>
      </div>

      {/* Maintenance alert if active */}
      {maintenanceMode && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-950">Platform Maintenance in Progress</h4>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              New consultation scheduling is temporarily restricted during this maintenance window. Please check back shortly or email us at <strong>{supportEmail}</strong> for urgent scheduling assistance.
            </p>
          </div>
        </div>
      )}

      {/* Advocate summary card */}
      <div className="panel p-4 flex items-center gap-4 bg-gradient-to-r from-white to-amber-50/20 border-chamber-100">
        <Avatar name={adv?.name} src={adv?.avatar?.url} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-ink truncate text-base">{adv?.name}</h2>
            {profile?.verificationStatus === 'Verified' && (
              <span className="rounded-full bg-chamber-50 border border-chamber-200 px-2 py-0.5 text-[10px] font-semibold text-chamber-700">
                ✓ Verified
              </span>
            )}
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            {profile?.experienceYears ? `${profile.experienceYears}+ yrs experience • ` : ''}
            {profile?.practiceAreas?.slice(0, 2).join(', ')}
          </p>
          {profile?.location?.city && (
            <p className="text-xs text-ink-muted">{profile.location.city}, {profile.location.state}</p>
          )}
        </div>
        <div className="text-right shrink-0 border-l border-line pl-4">
          <div className="flex items-center gap-1 font-bold text-ink text-lg justify-end">
            <IndianRupee className="h-4 w-4" />
            <span>{profile?.consultationFee?.toLocaleString() || '500'}</span>
          </div>
          <p className="text-[11px] text-ink-muted">per session</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="panel p-3">
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { num: 1, label: 'Legal Details' },
            { num: 2, label: 'Date & Slot' },
            { num: 3, label: 'Payment' },
            { num: 4, label: 'Confirmed' },
          ].map(({ num, label }) => {
            const isCompleted = step > num;
            const isCurrent = step === num;
            return (
              <div key={num} className="flex flex-col items-center gap-1">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isCompleted
                      ? 'bg-chamber-700 text-white'
                      : isCurrent
                        ? 'bg-chamber-600 text-white ring-4 ring-chamber-100'
                        : 'bg-paper border border-line text-ink-muted'
                    }`}
                >
                  {isCompleted ? '✓' : num}
                </div>
                <span className={`text-[11px] font-medium ${isCurrent ? 'text-chamber-700' : 'text-ink-muted'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Details */}
      {step === 1 && (
        <div className="panel p-6 space-y-6 animate-slide-up">
          <div>
            <h3 className="text-base font-semibold text-ink">1. Tell us about your legal requirement</h3>
            <p className="text-xs text-ink-muted mt-0.5">This allows the advocate to review relevant statutes prior to the meeting.</p>
          </div>

          {/* Quick template selector */}
          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Quick issue templates (click to auto-fill)
            </label>
            <div className="flex flex-wrap gap-2">
              {ISSUE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="rounded-full border border-chamber-200 bg-chamber-50/60 px-3 py-1 text-xs font-medium text-chamber-800 hover:bg-chamber-100 hover:border-chamber-300 transition-colors"
                >
                  + {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Legal Issue Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-ink">
                Legal Issue Description <span className="text-danger-500">*</span>
              </label>
              <span className="text-[11px] text-ink-muted">{form.legalIssue.length}/2000 chars</span>
            </div>
            <textarea
              rows={4}
              value={form.legalIssue}
              onChange={(e) => update('legalIssue', e.target.value)}
              placeholder="Describe what happened, parties involved, and the specific relief or advice you need..."
              className="input-base resize-none text-sm"
              maxLength={2000}
            />
            {aiResult && (
              <div className="mt-2.5 rounded-xl bg-chamber-50/80 border border-chamber-200 p-3 text-xs flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-chamber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-chamber-800">AI Matter Assistant</p>
                  <p className="text-chamber-700 mt-0.5">
                    Recommended Practice Area: <strong>{aiResult.practiceArea}</strong>
                  </p>
                  {aiResult.isUrgent && (
                    <Badge variant="warning" size="xs" className="mt-1.5">
                      Urgent Matter Identified
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Practice Area */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Practice Area</label>
            <select
              value={form.practiceArea}
              onChange={(e) => update('practiceArea', e.target.value)}
              className="input-base"
            >
              <option value="">Select practice area</option>
              {PRACTICE_AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Consultation Mode */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Preferred Consultation Mode</label>
            <div className="grid grid-cols-3 gap-3">
              {activeModes.map(({ value, label, desc, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update('mode', value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${form.mode === value
                      ? 'border-chamber-600 bg-chamber-50/80 text-chamber-900 shadow-sm ring-2 ring-chamber-500/20'
                      : 'border-line bg-white hover:border-chamber-300 text-ink'
                    }`}
                >
                  <div className={`p-2 rounded-lg ${form.mode === value ? 'bg-chamber-600 text-white' : 'bg-paper text-ink-muted'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold block">{label}</span>
                    <span className="text-[10px] text-ink-muted block mt-0.5">{desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Session Duration</label>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update('duration', value)}
                  className={`rounded-xl border p-3 text-center transition-all ${form.duration === value
                      ? 'border-chamber-600 bg-chamber-50/80 text-chamber-900 font-semibold ring-2 ring-chamber-500/20'
                      : 'border-line bg-white hover:border-chamber-300 text-ink text-sm'
                    }`}
                >
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-[10px] text-ink-muted mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <Button
            disabled={!form.legalIssue.trim()}
            onClick={() => setStep(2)}
            className="w-full gap-2 shadow-sm"
            size="lg"
          >
            <span>Proceed to Date & Time</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* STEP 2: Slot Selection */}
      {step === 2 && (
        <div className="panel p-6 space-y-6 animate-slide-up">
          <div>
            <h3 className="text-base font-semibold text-ink">2. Choose Appointment Date & Time</h3>
            <p className="text-xs text-ink-muted mt-0.5">Select from real-time available advocate working slots.</p>
          </div>

          {/* Quick Date Selectors */}
          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Select Date
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { label: 'Tomorrow', date: format(addDays(new Date(), 1), 'yyyy-MM-dd') },
                { label: 'Day After', date: format(addDays(new Date(), 2), 'yyyy-MM-dd') },
                { label: 'In 3 Days', date: format(addDays(new Date(), 3), 'yyyy-MM-dd') },
                { label: 'In 4 Days', date: format(addDays(new Date(), 4), 'yyyy-MM-dd') },
              ].map((d) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => update('date', d.date)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${form.date === d.date
                      ? 'bg-chamber-700 text-white border-chamber-700'
                      : 'bg-white border-line text-ink hover:border-chamber-300'
                    }`}
                >
                  {d.label} ({format(new Date(d.date), 'MMM d')})
                </button>
              ))}
            </div>
            <input
              type="date"
              value={form.date}
              min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              onChange={(e) => update('date', e.target.value)}
              className="input-base text-sm"
            />
          </div>

          {/* Slot Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-ink">
                Available Slots for {format(new Date(form.date), 'EEEE, MMMM d, yyyy')}
              </label>
              {availabilityData?.timezone && (
                <span className="text-[11px] text-ink-muted">Timezone: {availabilityData.timezone}</span>
              )}
            </div>

            {slotsLoading ? (
              <div className="p-8 text-center bg-paper rounded-xl">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-chamber-200 border-t-chamber-600 mx-auto mb-2" />
                <p className="text-xs text-ink-muted">Checking advocate availability...</p>
              </div>
            ) : availabilityData?.isBlocked ? (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3 items-center">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Advocate is unavailable on this date</p>
                  <p className="text-xs text-amber-700 mt-0.5">{availabilityData.reason || 'Please select another date'}</p>
                </div>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="rounded-xl bg-paper p-6 text-center border border-dashed border-line">
                <Clock className="h-8 w-8 text-ink-muted mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-ink">No available slots on this date</p>
                <p className="text-xs text-ink-muted mt-1">Please choose another day or pick from the quick date options above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {morningSlots.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-2">
                      🌅 Morning Slots
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {morningSlots.map((slot) => (
                        <button
                          key={slot.startTime}
                          type="button"
                          disabled={slot.isBooked}
                          onClick={() => update('timeSlot', slot.startTime)}
                          className={`rounded-xl border py-2.5 px-2 text-sm font-medium transition-all ${slot.isBooked
                              ? 'bg-paper text-ink-muted/50 border-line cursor-not-allowed line-through'
                              : form.timeSlot === slot.startTime
                                ? 'border-chamber-600 bg-chamber-600 text-white shadow-sm ring-2 ring-chamber-500/20'
                                : 'border-line bg-white hover:border-chamber-300 text-ink'
                            }`}
                        >
                          {slot.startTime}
                          {slot.isBooked && <span className="block text-[9px] no-underline">Booked</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {afternoonSlots.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-2">
                      ☀️ Afternoon / Evening Slots
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {afternoonSlots.map((slot) => (
                        <button
                          key={slot.startTime}
                          type="button"
                          disabled={slot.isBooked}
                          onClick={() => update('timeSlot', slot.startTime)}
                          className={`rounded-xl border py-2.5 px-2 text-sm font-medium transition-all ${slot.isBooked
                              ? 'bg-paper text-ink-muted/50 border-line cursor-not-allowed line-through'
                              : form.timeSlot === slot.startTime
                                ? 'border-chamber-600 bg-chamber-600 text-white shadow-sm ring-2 ring-chamber-500/20'
                                : 'border-line bg-white hover:border-chamber-300 text-ink'
                            }`}
                        >
                          {slot.startTime}
                          {slot.isBooked && <span className="block text-[9px] no-underline">Booked</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setStep(1)} className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleBook}
              disabled={!form.timeSlot || slotsLoading || maintenanceMode}
              loading={loading}
              className="flex-1 shadow-sm gap-2"
              size="lg"
            >
              <span>{maintenanceMode ? 'Booking Paused (Maintenance Mode)' : 'Confirm Slot & Proceed to Pay'}</span>
              {!maintenanceMode && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Payment */}
      {step === 3 && payment && (
        <div className="panel p-6 space-y-6 animate-slide-up">
          <div>
            <h3 className="text-base font-semibold text-ink">3. Secure Escrow Payment</h3>
            <p className="text-xs text-ink-muted mt-0.5">Funds are held safely in escrow until your consultation is completed.</p>
          </div>

          {/* Booking Summary Box */}
          <div className="rounded-xl border border-line bg-paper/60 p-4 space-y-2.5">
            <div className="flex justify-between text-xs text-ink-muted">
              <span>Appointment Date & Time</span>
              <span className="font-semibold text-ink">
                {format(new Date(form.date), 'MMM d, yyyy')} at {form.timeSlot}
              </span>
            </div>
            <div className="flex justify-between text-xs text-ink-muted">
              <span>Consultation Mode</span>
              <span className="font-semibold text-ink capitalize">{form.mode} Session</span>
            </div>
            <div className="border-t border-line my-1" />
            <div className="flex justify-between text-sm">
              <span className="text-ink">Consultation Fee</span>
              <span className="font-medium text-ink">₹{payment.amount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-ink-muted">
              <span>Platform & Facilitation Fee (10% incl. GST)</span>
              <span>₹{payment.platformFee || Math.round(payment.amount * 0.1)}</span>
            </div>
            <div className="border-t border-line pt-2 flex justify-between font-bold text-base text-ink">
              <span>Total Payable</span>
              <span className="text-chamber-700">₹{payment.amount?.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`rounded-xl border p-3.5 flex items-center gap-3 transition-all ${paymentMethod === 'upi'
                    ? 'border-chamber-600 bg-chamber-50/80 text-chamber-900 ring-2 ring-chamber-500/20'
                    : 'border-line bg-white hover:border-chamber-300'
                  }`}
              >
                <QrCode className="h-5 w-5 text-chamber-700 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-semibold">UPI / Instant QR</p>
                  <p className="text-[10px] text-ink-muted">GPay, PhonePe, Paytm</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`rounded-xl border p-3.5 flex items-center gap-3 transition-all ${paymentMethod === 'card'
                    ? 'border-chamber-600 bg-chamber-50/80 text-chamber-900 ring-2 ring-chamber-500/20'
                    : 'border-line bg-white hover:border-chamber-300'
                  }`}
              >
                <CreditCard className="h-5 w-5 text-chamber-700 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-semibold">Card / NetBanking</p>
                  <p className="text-[10px] text-ink-muted">Debit/Credit cards & banks</p>
                </div>
              </button>
            </div>
          </div>

          {/* Escrow & Security Assurance */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex gap-3 text-xs text-emerald-800">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">LegalConnect Escrow Protection Guarantee</p>
              <p className="text-emerald-700 mt-0.5 text-[11px]">
                Your payment is released to the advocate only after the consultation concludes successfully. Full refund applies in case of advocate cancellation.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(2)}>
              ← Change Slot
            </Button>
            <Button
              onClick={handlePayment}
              loading={loading}
              className="flex-1 gap-2 shadow-md bg-emerald-700 hover:bg-emerald-800 text-white"
              size="lg"
            >
              <IndianRupee className="h-4 w-4" />
              <span>Pay ₹{payment.amount?.toLocaleString()} & Confirm Booking</span>
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Success / Confirmed */}
      {step === 4 && (
        <div className="panel p-8 text-center space-y-6 animate-slide-up border-emerald-200 shadow-sm">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-ink">Consultation Confirmed!</h2>
            <p className="text-ink-soft text-sm mt-1">
              Your appointment with <strong>{adv?.name}</strong> has been successfully booked.
            </p>
          </div>

          {/* Details Card */}
          <div className="max-w-md mx-auto rounded-xl border border-line bg-paper/60 p-4 text-left space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-ink-muted">Booking Reference:</span>
              <span className="font-mono font-bold text-ink">{consultation?._id?.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Scheduled Date:</span>
              <span className="font-semibold text-ink">
                {consultation?.date ? format(new Date(consultation.date), 'EEEE, MMMM d, yyyy') : form.date}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Time Slot:</span>
              <span className="font-semibold text-ink">{consultation?.timeSlot || form.timeSlot} ({form.duration} mins)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Mode:</span>
              <span className="font-semibold text-ink capitalize">{form.mode} Meeting</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Payment Status:</span>
              <span className="font-semibold text-emerald-700">✓ Paid (Escrow Verified)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {form.mode === 'video' && consultation?._id && (
              <Button
                to={`/client/consultations/${consultation._id}/video`}
                variant="primary"
                size="lg"
                className="gap-2"
              >
                <Video className="h-4 w-4" /> Go to Video Call Room
              </Button>
            )}
            <Button
              to="/client/consultations"
              variant={form.mode === 'video' ? 'secondary' : 'primary'}
              size="lg"
            >
              View My Consultations
            </Button>
            <Button to="/client/dashboard" variant="outline" size="lg">
              Return to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
