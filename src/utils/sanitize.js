/**
 * Limpa o texto de versículos vindo de API de terceiros (bolls.life).
 *
 * A API devolve pequenos trechos de HTML (<i>, <br/>, <S>1234</S> com numeração Strong...).
 * Em vez de injetar HTML na página (risco de XSS), convertemos tudo para TEXTO PURO:
 *  - <br> vira quebra de linha;
 *  - <S>…</S> (números Strong) e <sup>/<sub> são descartados;
 *  - qualquer outra tag é removida, mantendo só o texto.
 *
 * @param {unknown} html
 * @returns {string}
 */
export function verseToPlainText(html) {
  if (html === null || html === undefined) return ''
  let text = String(html)

  text = text.replace(/<s[^>]*>[\s\S]*?<\/s>/gi, '')
  text = text.replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
  text = text.replace(/<sub[^>]*>[\s\S]*?<\/sub>/gi, '')
  text = text.replace(/<br\s*\/?>/gi, '\n')

  // Remove qualquer tag restante. Como o resultado vai para um nó de texto do React
  // (nunca como HTML), o que sobrar de "<" é inofensivo.
  text = text.replace(/<[^>]*>/g, '')

  // Decodifica entidades HTML comuns sem tocar no DOM.
  const entities = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&nbsp;': ' ' }
  text = text.replace(/&(amp|lt|gt|quot|apos|nbsp|#39);/g, (m) => entities[m] ?? m)

  return text.replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim()
}

/**
 * Aceita só links http(s) absolutos. Bloqueia `javascript:`, `data:` e afins, que em um `href`
 * executariam código ao serem clicados.
 *
 * @param {unknown} value
 * @returns {string|null} a URL normalizada, ou null se não for segura
 */
export function safeHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}
