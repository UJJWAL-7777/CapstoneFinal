import { useEffect, useState } from 'react';
import { advocateService } from '../../services/advocateService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/ui/Button.jsx';
import { Save, Plus, X, Sparkles, Clock, Calendar as CalendarIcon } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

const DEFAULT_SLOTS = [
  { startTime: '10:00', endTime: '11:00' },
  { startTime: '11:00', endTime: '12:00' },
  { startTime: '12:00', endTime: '13:00' },
  { startTime: '14:00', endTime: '15:00' },
  { startTime: '15:00', endTime: '16:00' },
  { startTime: '16:00', endTime: '17:00' },
  { startTime: '17:00', endTime: '18:00' },
];

const defaultSlot = () => ({ startTime: '10:00', endTime: '11:00' });

export default function AdvocateCalendar() {
  const toast = useToast();
  const [availability, setAvailability] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    advocateService.getMyAvailability().then((data) => {
      setAvailability(data);
    }).catch(() => {
      toast.error('Failed to load availability');
    });
  }, []);

  const applyStandardHours = () => {
    const standardSchedule = DAYS.map((day, idx) => {
      if (idx === 0) {
        // Sunday off
        return { dayOfWeek: 0, isActive: false, slots: [] };
      }
      return {
        dayOfWeek: idx,
        isActive: true,
        slots: [...DEFAULT_SLOTS],
      };
    });

    setAvailability((prev) => ({
      ...prev,
      weeklySchedule: standardSchedule,
      slotDuration: prev?.slotDuration || 60,
    }));
    toast.info('Standard business hours (Mon-Sat, 10 AM - 6 PM) applied! Click Save to apply.');
  };

  const toggleDay = (dayIndex) => {
    setAvailability((prev) => {
      const schedule = [...(prev.weeklySchedule || [])];
      const idx = schedule.findIndex((d) => d.dayOfWeek === dayIndex);
      if (idx === -1) {
        schedule.push({ dayOfWeek: dayIndex, isActive: true, slots: [defaultSlot()] });
      } else {
        schedule[idx] = { ...schedule[idx], isActive: !schedule[idx].isActive };
      }
      return { ...prev, weeklySchedule: schedule };
    });
  };

  const addSlot = (dayIndex) => {
    setAvailability((prev) => {
      const schedule = prev.weeklySchedule.map((d) =>
        d.dayOfWeek === dayIndex ? { ...d, slots: [...(d.slots || []), defaultSlot()] } : d
      );
      return { ...prev, weeklySchedule: schedule };
    });
  };

  const removeSlot = (dayIndex, slotIdx) => {
    setAvailability((prev) => {
      const schedule = prev.weeklySchedule.map((d) =>
        d.dayOfWeek === dayIndex ? { ...d, slots: d.slots.filter((_, i) => i !== slotIdx) } : d
      );
      return { ...prev, weeklySchedule: schedule };
    });
  };

  const updateSlot = (dayIndex, slotIdx, key, value) => {
    setAvailability((prev) => {
      const schedule = prev.weeklySchedule.map((d) =>
        d.dayOfWeek === dayIndex
          ? { ...d, slots: d.slots.map((s, i) => i === slotIdx ? { ...s, [key]: value } : s) }
          : d
      );
      return { ...prev, weeklySchedule: schedule };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await advocateService.updateAvailability({
        weeklySchedule: availability.weeklySchedule,
        slotDuration: availability.slotDuration || 60,
        timezone: availability.timezone || 'Asia/Kolkata',
      });
      toast.success('Availability schedule saved successfully');
    } catch {
      toast.error('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  if (!availability) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-chamber-200 border-t-chamber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Availability & Working Hours</h1>
          <p className="text-ink-soft text-sm mt-0.5">Configure when clients can book consultations with you</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={applyStandardHours}
            className="text-xs gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-chamber-600" /> Standard Hours (10 AM - 6 PM)
          </Button>
          <Button onClick={handleSave} loading={saving} size="sm" className="gap-1.5 shadow-sm">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </Button>
        </div>
      </div>

      <div className="panel p-4 flex flex-wrap items-center justify-between gap-4 bg-chamber-50/40 border-chamber-200">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              Slot Duration
            </label>
            <select
              value={availability.slotDuration || 60}
              onChange={(e) => setAvailability((p) => ({ ...p, slotDuration: +e.target.value }))}
              className="input-base w-36 text-xs"
            >
              {[30, 45, 60, 90].map((d) => (
                <option key={d} value={d}>{d} minutes</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              Timezone
            </label>
            <span className="text-xs font-medium text-ink bg-white border border-line px-3 py-2 rounded-lg inline-block">
              {availability.timezone || 'Asia/Kolkata (IST)'}
            </span>
          </div>
        </div>

        <p className="text-xs text-ink-muted max-w-sm">
          💡 If you leave days unconfigured, standard professional business hours (10 AM - 6 PM Mon-Sat) will automatically be used.
        </p>
      </div>

      <div className="space-y-3">
        {DAYS.map((day, idx) => {
          const dayConfig = availability.weeklySchedule?.find((d) => d.dayOfWeek === idx);
          const isActive = !!dayConfig?.isActive;
          return (
            <div
              key={day}
              className={`panel p-4 transition-all ${
                isActive ? 'border-chamber-200 shadow-sm' : 'opacity-70 bg-paper/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleDay(idx)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isActive ? 'bg-chamber-600' : 'bg-line'
                  }`}
                  aria-label={`Toggle ${day}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="w-28 font-semibold text-sm text-ink">{day}</span>
                {isActive && dayConfig?.slots?.length > 0 ? (
                  <span className="text-xs font-medium text-chamber-700 bg-chamber-50 border border-chamber-200 px-2 py-0.5 rounded-full">
                    {dayConfig.slots.length} time slot(s)
                  </span>
                ) : (
                  <span className="text-xs text-ink-muted">Unavailable / Day Off</span>
                )}
              </div>

              {isActive && (
                <div className="mt-4 space-y-2 sm:ml-16 pl-2 border-l-2 border-chamber-200">
                  {(dayConfig?.slots || []).map((slot, si) => (
                    <div key={si} className="flex items-center gap-2 flex-wrap">
                      <select
                        value={slot.startTime}
                        onChange={(e) => updateSlot(idx, si, 'startTime', e.target.value)}
                        className="input-base w-28 text-xs"
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <span className="text-xs text-ink-muted">to</span>
                      <select
                        value={slot.endTime}
                        onChange={(e) => updateSlot(idx, si, 'endTime', e.target.value)}
                        className="input-base w-28 text-xs"
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeSlot(idx, si)}
                        className="text-danger-500 hover:bg-danger-50 rounded-lg p-1.5 transition-colors"
                        title="Delete slot"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addSlot(idx)}
                    className="flex items-center gap-1 text-xs font-semibold text-chamber-700 hover:underline pt-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add custom slot
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
