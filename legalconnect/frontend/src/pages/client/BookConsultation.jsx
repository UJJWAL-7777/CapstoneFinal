import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, MessageSquare, Users, IndianRupee, AlertCircle } from 'lucide-react';
import { advocateService } from '../../services/advocateService.js';
import { consultationService } from '../../services/consultationService.js';
import { paymentService } from '../../services/paymentService.js';
import { aiService } from '../../services/aiService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { PRACTICE_AREAS } from '../../utils/constants.js';
import { format, addDays } from 'date-fns';

const MODES = [
  { value: 'video', label: 'Video Call', icon: Video },
  { value: 'chat', label: 'Chat', icon: MessageSquare },
  { value: 'in-person', label: 'In-Person', icon: Users },
];
const DURATIONS = [30, 60, 90];

export default function BookConsultation() {
  const { advocateId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [advocate, setAdvocate] = useState(null);
  const [availabilityData, setAvailabilityData] = useState(null);
  const [step, setStep] = useState(1); // 1=details, 2=slot, 3=payment, 4=done
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

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
    advocateService.getProfile(advocateId).then((d) => setAdvocate(d));
  }, [advocateId]);

  useEffect(() => {
    if (form.date) {
      advocateService.getAvailability(advocateId, form.date).then(setAvailabilityData).catch(() => {});
    }
  }, [advocateId, form.date]);

  // AI analysis when issue text changes
  useEffect(() => {
    if (form.legalIssue.length < 20) return;
    const t = setTimeout(async () => {
      try {
        const result = await aiService.assist(form.legalIssue);
        setAiResult(result);
        if (result.practiceArea && !form.practiceArea) {
          setForm((p) => ({ ...p, practiceArea: result.practiceArea }));
        }
      } catch { /* silent */ }
    }, 1000);
    return () => clearTimeout(t);
  }, [form.legalIssue]);

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleBook = async () => {
    if (!form.timeSlot) { toast.error('Please select a time slot'); return; }
    setLoading(true);
    try {
      const data = await consultationService.create({ advocateId, ...form });
      setConsultation(data.consultation);
      setPayment(data.payment);
      setStep(3);
    } catch (e) {
      toast.error(e.response?.data?.error?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      await paymentService.confirm(payment._id);
      setStep(4);
      toast.success('Booking confirmed! Your consultation is scheduled.');
    } catch { toast.error('Payment failed'); }
    finally { setLoading(false); }
  };

  if (!advocate) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-chamber-200 border-t-chamber-600" /></div>;

  const { user: adv, profile } = advocate;
  const availableSlots = availabilityData?.slots?.filter((s) => !s.isBooked) || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl">Book Consultation</h1>
        <p className="text-ink-soft mt-1">with {adv?.name}</p>
      </div>

      {/* Advocate summary */}
      <div className="panel p-4 flex items-center gap-4">
        <Avatar name={adv?.name} src={adv?.avatar?.url} size="md" />
        <div className="flex-1">
          <p className="font-semibold">{adv?.name}</p>
          <p className="text-sm text-ink-muted">{profile?.practiceAreas?.slice(0, 2).join(', ')}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-ink">₹{profile?.consultationFee?.toLocaleString()}</p>
          <p className="text-xs text-ink-muted">per session</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {['Details', 'Slot', 'Payment', 'Done'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`rounded-full h-7 w-7 flex items-center justify-center text-xs font-bold ${step > i + 1 ? 'bg-chamber-600 text-white' : step === i + 1 ? 'bg-chamber-600 text-white' : 'bg-line text-ink-muted'}`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${step === i + 1 ? 'font-medium text-ink' : 'text-ink-muted'}`}>{s}</span>
            {i < 3 && <div className="flex-1 h-px bg-line min-w-4" />}
          </div>
        ))}
      </div>

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="panel p-6 space-y-5 animate-slide-up">
          <h2 className="text-lg">Describe your legal issue</h2>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Legal Issue <span className="text-danger-500">*</span></label>
            <textarea
              rows={4}
              value={form.legalIssue}
              onChange={(e) => update('legalIssue', e.target.value)}
              placeholder="Describe your legal situation in detail..."
              className="input-base resize-none"
            />
            {aiResult && (
              <div className="mt-2 rounded-xl bg-chamber-50 border border-chamber-100 p-3">
                <p className="text-xs font-semibold text-chamber-700 mb-1">🤖 AI Suggestion</p>
                <p className="text-xs text-chamber-600">Detected area: <strong>{aiResult.practiceArea}</strong></p>
                {aiResult.isUrgent && <Badge variant="warning" className="mt-1">Urgent matter detected</Badge>}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Practice Area</label>
            <select value={form.practiceArea} onChange={(e) => update('practiceArea', e.target.value)} className="input-base">
              <option value="">Select practice area</option>
              {PRACTICE_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">Consultation Mode</label>
            <div className="grid grid-cols-3 gap-3">
              {MODES.filter((m) => profile?.consultationModes?.includes(m.value)).map(({ value, label, icon: Icon }) => (
                <button key={value} type="button" onClick={() => update('mode', value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${form.mode === value ? 'border-chamber-500 bg-chamber-50 text-chamber-700' : 'border-line hover:border-chamber-300'}`}>
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">Duration</label>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button key={d} type="button" onClick={() => update('duration', d)}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${form.duration === d ? 'border-chamber-500 bg-chamber-50 text-chamber-700' : 'border-line hover:border-chamber-300'}`}>
                  {d} min
                </button>
              ))}
            </div>
          </div>

          <Button disabled={!form.legalIssue.trim()} onClick={() => setStep(2)} className="w-full">
            Choose Time Slot →
          </Button>
        </div>
      )}

      {/* Step 2: Slot selection */}
      {step === 2 && (
        <div className="panel p-6 space-y-5 animate-slide-up">
          <h2 className="text-lg">Select Date & Time</h2>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Date</label>
            <input type="date" value={form.date} min={format(addDays(new Date(), 1), 'yyyy-MM-dd')} onChange={(e) => update('date', e.target.value)} className="input-base" />
          </div>

          {availabilityData?.isBlocked ? (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-700">Advocate is not available on this date. {availabilityData.reason}</p>
            </div>
          ) : availableSlots.length === 0 ? (
            <p className="text-sm text-ink-muted text-center py-4">No available slots on this date. Try another date.</p>
          ) : (
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Available Slots</label>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <button key={slot.startTime} type="button" onClick={() => update('timeSlot', slot.startTime)}
                    className={`rounded-lg border py-2 text-sm font-medium transition-colors ${form.timeSlot === slot.startTime ? 'border-chamber-500 bg-chamber-50 text-chamber-700' : 'border-line hover:border-chamber-300'}`}>
                    {slot.startTime}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
            <Button onClick={handleBook} disabled={!form.timeSlot} loading={loading} className="flex-1">
              Confirm Booking →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && payment && (
        <div className="panel p-6 space-y-5 animate-slide-up">
          <h2 className="text-lg">Payment</h2>
          <div className="rounded-xl bg-paper p-4 space-y-2">
            <div className="flex justify-between text-sm"><span>Consultation fee</span><span>₹{payment.amount?.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm text-ink-muted"><span>Platform fee</span><span>₹{payment.platformFee}</span></div>
            <div className="border-t border-line pt-2 flex justify-between font-bold"><span>Total</span><span>₹{payment.amount?.toLocaleString()}</span></div>
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-700 flex gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> This is a mock payment for demonstration. No real money is charged.
          </div>
          <Button onClick={handlePayment} loading={loading} className="w-full" size="lg">
            <IndianRupee className="h-4 w-4" /> Pay ₹{payment.amount?.toLocaleString()} (Mock)
          </Button>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="panel p-8 text-center animate-slide-up">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-2xl">Booking Confirmed!</h2>
          <p className="mt-2 text-ink-soft">
            Your consultation with {adv?.name} is scheduled for{' '}
            {format(new Date(consultation?.date), 'EEEE, MMMM d')} at {consultation?.timeSlot}.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button to="/client/consultations" size="lg">View My Consultations</Button>
            <Button to="/client/dashboard" variant="secondary" size="lg">Back to Dashboard</Button>
          </div>
        </div>
      )}
    </div>
  );
}
