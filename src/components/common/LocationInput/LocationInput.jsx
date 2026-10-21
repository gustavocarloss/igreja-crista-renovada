import { useEffect, useMemo, useRef, useState } from 'react'
import './LocationInput.css'

const MIN_CHARS = 3
const DEBOUNCE_MS = 350

/** Monta um endereço legível a partir de um resultado do Photon (OpenStreetMap). */
function formatPhoton(feature) {
  const p = feature.properties || {}
  const street = [p.street || (p.type === 'street' ? p.name : null), p.housenumber].filter(Boolean).join(', ')
  const place = p.name && p.name !== p.street ? p.name : null
  const parts = [place, street, p.district || p.locality, p.city || p.county, p.state].filter(Boolean)
  return [...new Set(parts)].join(' - ')
}

/**
 * Campo de local com:
 * - sugestões de locais já usados em outros eventos;
 * - autocompletar de endereços (Photon/OpenStreetMap, gratuito e sem chave).
 */
export default function LocationInput({ id, value, onChange, usedLocations = [], required }) {
  const [open, setOpen] = useState(false)
  const [remote, setRemote] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const wrapRef = useRef(null)
  const skipFetchRef = useRef(false)

  const query = value.trim()

  const used = useMemo(() => {
    const q = query.toLowerCase()
    return usedLocations.filter((l) => l && (!q || l.toLowerCase().includes(q)) && l !== value).slice(0, 5)
  }, [usedLocations, query, value])

  useEffect(() => {
    if (skipFetchRef.current) {
      skipFetchRef.current = false
      return undefined
    }
    if (query.length < MIN_CHARS) {
      setRemote([])
      return undefined
    }
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=default&lat=-15.78&lon=-47.93`
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) throw new Error('falha')
        const data = await res.json()
        const list = [...new Set((data.features || []).map(formatPhoton).filter(Boolean))]
        setRemote(list)
      } catch (err) {
        if (err.name !== 'AbortError') setRemote([])
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const remoteFiltered = remote.filter((r) => !used.includes(r))
  const options = [
    ...used.map((label) => ({ label, kind: 'used' })),
    ...remoteFiltered.map((label) => ({ label, kind: 'remote' }))
  ]

  const choose = (label) => {
    skipFetchRef.current = true
    onChange(label)
    setOpen(false)
    setActiveIdx(-1)
  }

  const onKeyDown = (e) => {
    if (!open || !options.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => (i + 1) % options.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => (i <= 0 ? options.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      choose(options[activeIdx].label)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showList = open && (options.length > 0 || loading)

  return (
    <div className="location-input" ref={wrapRef}>
      <input
        id={id}
        type="text"
        placeholder="Ex: Rua das Flores, 123, São Paulo"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setActiveIdx(-1)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        required={required}
      />
      {showList && (
        <ul className="location-suggestions" id={`${id}-list`} role="listbox">
          {used.length > 0 && <li className="location-group">Locais já usados</li>}
          {options.map((opt, idx) => (
            <li
              key={`${opt.kind}-${opt.label}`}
              role="option"
              aria-selected={idx === activeIdx}
              className={`location-option ${idx === activeIdx ? 'active' : ''}`}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => choose(opt.label)}
            >
              <span className="location-icon" aria-hidden="true">
                {opt.kind === 'used' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                )}
              </span>
              <span className="location-label">{opt.label}</span>
            </li>
          ))}
          {loading && <li className="location-loading">Buscando endereços...</li>}
        </ul>
      )}
    </div>
  )
}
