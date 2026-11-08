import { useState } from 'react'
import useBackHandler from '../../../hooks/useBackHandler'
import './TimePicker.css'

const pad = (n) => String(n).padStart(2, '0')
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i))
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5))

/**
 * Seletor de horário no visual do app (substitui o relógio nativo do Android, que corta botões em alguns aparelhos).
 * `value`/`onChange` usam o formato "HH:mm", igual ao <input type="time">.
 */
export default function TimePicker({ id, value, onChange }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState({ h: '', m: '' })

  const openSheet = () => {
    const [h = '', m = ''] = (value || '').split(':')
    setDraft({ h, m: m || '00' })
    setOpen(true)
  }
  const confirm = () => {
    onChange(`${draft.h}:${draft.m}`)
    setOpen(false)
  }

  useBackHandler(open, () => setOpen(false))

  const chip = (field, v) => (
    <button
      key={v}
      type="button"
      className={`time-chip ${draft[field] === v ? 'selected' : ''}`}
      aria-pressed={draft[field] === v}
      onClick={() => setDraft({ ...draft, [field]: v })}
    >
      {v}
    </button>
  )

  return (
    <>
      <button type="button" id={id} className={`time-picker-field ${value ? '' : 'empty'}`} onClick={openSheet}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        {value || '--:--'}
      </button>

      {open && (
        <div className="time-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="time-sheet" role="dialog" aria-modal="true" aria-label="Escolher horário" onClick={(e) => e.stopPropagation()}>
            <div className="time-sheet-preview">
              {draft.h || '--'}:{draft.m}
            </div>
            <p className="time-sheet-label">Hora</p>
            <div className="time-grid">{HOURS.map((h) => chip('h', h))}</div>
            <p className="time-sheet-label">Minutos</p>
            <div className="time-grid">{MINUTES.map((m) => chip('m', m))}</div>
            <div className="time-sheet-actions">
              <button type="button" className="time-btn-cancel" onClick={() => setOpen(false)}>Cancelar</button>
              <button type="button" className="time-btn-confirm" onClick={confirm} disabled={!draft.h}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
