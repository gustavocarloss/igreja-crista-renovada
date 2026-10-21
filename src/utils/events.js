import { extractLocalDateAndTime } from './date'

/** Um evento é considerado "em andamento" por 2h depois do horário de início; depois disso sai da home. */
export const LIVE_WINDOW_MS = 2 * 60 * 60 * 1000

/**
 * Regra ÚNICA de status de evento, usada em todas as telas.
 *
 * - `upcoming`: ainda não começou (ou sem data definida)
 * - `live`: começou há menos de 4h
 * - `past`: encerrado
 *
 * @param {string|Date|null|undefined} rawDate
 * @param {Date} [now]
 * @returns {'upcoming'|'live'|'past'}
 */
export function getEventStatus(rawDate, now = new Date()) {
  if (!rawDate) return 'upcoming'
  const start = new Date(rawDate)
  if (Number.isNaN(start.getTime())) return 'upcoming'
  const elapsed = now.getTime() - start.getTime()
  if (elapsed < 0) return 'upcoming'
  if (elapsed < LIVE_WINDOW_MS) return 'live'
  return 'past'
}

const formatHorario = (rawDate) =>
  rawDate
    ? new Date(rawDate)
        .toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
        .replace(',', ' às')
    : ''

/** Linha da tabela `meeting` → objeto usado pela interface. */
export function mapEventRow(row) {
  const { data, hora } = extractLocalDateAndTime(row.meeting_date)
  return {
    id: row.id,
    nome: row.meeting_name,
    link: row.meeting_link,
    local: row.meeting_location,
    raw_date: row.meeting_date,
    horario: formatHorario(row.meeting_date),
    pastor: row.meeting_priest,
    descricao: row.meeting_description,
    aoVivo: !!row.meeting_link,
    data,
    hora
  }
}

/** Objeto do formulário → linha da tabela `meeting`. */
export function eventToRow(evento) {
  const localDateTime = new Date(`${evento.data}T${evento.hora}:00`)
  return {
    meeting_name: evento.nome.trim(),
    meeting_link: evento.link ? evento.link.trim() : null,
    meeting_location: evento.local.trim(),
    meeting_date: localDateTime.toISOString(),
    meeting_priest: evento.pastor ? evento.pastor.trim() : null,
    meeting_description: evento.descricao ? evento.descricao.trim() : null
  }
}
