import { CheckCircle, XCircle } from 'lucide-react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        {danger
          ? <XCircle className="h-8 w-8 shrink-0 text-danger-500 mt-0.5" />
          : <CheckCircle className="h-8 w-8 shrink-0 text-chamber-500 mt-0.5" />
        }
        <p className="text-ink-soft leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}
