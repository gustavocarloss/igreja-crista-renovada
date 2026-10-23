/**
 * Utilitários de imagem de perfil.
 */
import { detectImageType } from './chatImage'

const MAX_INPUT_BYTES = 8 * 1024 * 1024

/**
 * Formatos raster em base64. SVG fica de fora (pode carregar script/recursos externos) e
 * o alfabeto base64 não tem aspas nem parênteses, então o valor é seguro até dentro de `url()` no CSS.
 */
const SAFE_AVATAR_RE = /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/

/**
 * O avatar vem do banco e qualquer usuário pode gravar o próprio pela API, então só
 * renderizamos data URLs de imagem — nunca URLs externas (rastreamento) nem SVG.
 *
 * @param {unknown} value
 * @returns {value is string}
 */
export function isSafeAvatar(value) {
  return typeof value === 'string' && SAFE_AVATAR_RE.test(value)
}

/** Avatar pronto para usar em `src`/`url()`, ou `null` quando ausente ou suspeito. */
export const safeAvatar = (value) => (isSafeAvatar(value) ? value : null)

/**
 * Lê uma imagem escolhida pelo usuário, recorta em quadrado e reduz para `size`x`size` (JPEG).
 * Resultado típico: 10–30 KB em vez de vários MB — importante para celular e para o banco.
 * Redesenhar no canvas também descarta metadados (EXIF com localização) e qualquer conteúdo escondido.
 *
 * @param {File} file
 * @param {number} [size=256]
 * @returns {Promise<string>} data URL (image/jpeg)
 */
export async function resizeImageToDataUrl(file, size = 256) {
  if (!file) {
    throw new Error('Selecione um arquivo de imagem válido.')
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('A imagem é muito grande. Escolha uma foto de até 8 MB.')
  }

  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  if (!detectImageType(header)) {
    throw new Error('Arquivo não permitido. Escolha uma foto (JPG, PNG, GIF ou WEBP).')
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Não foi possível ler a imagem selecionada.'))
      el.src = objectUrl
    })

    const side = Math.min(img.naturalWidth, img.naturalHeight)
    if (!side) throw new Error('Imagem inválida.')
    const sx = (img.naturalWidth - side) / 2
    const sy = (img.naturalHeight - side) / 2

    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)
    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)

    return canvas.toDataURL('image/jpeg', 0.82)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
