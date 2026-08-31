/**
 * Extrai a data local no formato YYYY-MM-DD e hora no formato HH:mm a partir de uma string de data.
 *
 * @param {string|Date} dateStr - A string de data ou objeto Date.
 * @returns {{ data: string, hora: string }} Objeto contendo data formatada e hora formatada.
 */
export const extractLocalDateAndTime = (dateStr) => {
  if (!dateStr) return { data: '', hora: '' }
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return {
    data: `${year}-${month}-${day}`,
    hora: `${hours}:${minutes}`
  }
}
