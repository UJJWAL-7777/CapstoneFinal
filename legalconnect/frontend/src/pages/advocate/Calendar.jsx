import { useEffect, useState } from 'react';
import { advocateService } from '../../services/advocateService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/ui/Button.jsx';
import { Save, Plus, X } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

const defaultSlot = () => ({ startTime: '09:00', endTime: '10:00' });

export default function AdvocateCalendar() {
  const toast = useToast();
  const [availability, setAvailability] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    advocateService.getMyAvailability().then(setAvailability).catch(() => {});
  }, []);

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
      toast.success('Availability saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  if (!availability) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-chamber-200 border-t-chamber-600" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Availability Calendar</h1>
          <p className="text-ink-soft mt-1">Set your weekly schedule for consultations</p>
        </div>
        <Button onClick={handleSave} loading={saving}><Save className="h-4 w-4" /> Save</Button>
      </div>

      <div className="panel p-5 mb-4 flex gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Slot Duration</label>
          <select value={availability.slotDuration || 60} onChange={(e) => setAvailability((p) => ({ ...p, slotDuration: +e.target.value }))} className="input-base w-36">
            {[30, 45, 60, 90].map((d) => <option key={d} value={d}>{d} minutes</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {DAYS.map((day, idx) => {
          const dayConfig = availability.weeklySchedule?.find((d) => d.dayOfWeek === idx);
          const isActive = dayConfig?.isActive;
          return (
            <div key={day} className="panel p-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleDay(idx)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-chamber-600' : 'bg-line'}`}
                  aria-label={`Toggle ${day}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="w-28 font-medium text-sm">{day}</span>
                {isActive && dayConfig?.slots?.length > 0 ? (
                  <span className="text-xs text-ink-muted">{dayConfig.slots.length} slot(s)</span>
                ) : (
                  <span className="text-xs text-ink-muted">Unavailable</span>
                )}
              </div>

              {isActive && (
                <div className="mt-4 space-y-2 ml-16">
                  {(dayConfig?.slots || []).map((slot, si) => (
                    <div key={si} className="flex items-center gap-2">
                      <select value={slot.startTime} onChange={(e) => updateSlot(idx, si, 'startTime', e.target.value)} className="input-base w-28">
                        {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <span className="text-ink-muted">to</span>
                      <select value={slot.endTime} onChange={(e) => updateSlot(idx, si, 'endTime', e.target.value)} className="input-base w-28">
                        {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <button onClick={() => removeSlot(idx, si)} className="text-danger-500 hover:bg-danger-50 rounded-lg p-1.5"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => addSlot(idx)} className="flex items-center gap-1 text-sm text-chamber-600 hover:underline">
                    <Plus className="h-3.5 w-3.5" /> Add slot
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
