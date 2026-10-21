/**
 * Envio SEGURO de imagens no chat.
 *
 * Camadas de proteção:
 * 1. Tamanho máximo do arquivo original.
 * 2. Verificação da "assinatura" real do arquivo (magic bytes): só JPEG, PNG, GIF e WEBP.
 *    Um .exe renomeado para .jpg é rejeitado, mesmo que o navegador diga que é imagem.
 * 3. A imagem é decodificada pelo navegador e REDESENHADA em um canvas, gerando um JPEG novo.
 *    Isso descarta qualquer conteúdo escondido no arquivo (scripts, payloads, metadados/EXIF com
 *    localização etc.) — só os pixels sobrevivem.
 * 4. Na exibição, só aceitamos data URLs `data:image/jpeg;base64,...` (ver isSafeChatImage).
 */

export const MAX_CHAT_IMAGE_INPUT_BYTES = 5 * 1024 * 1024
const MAX_SIDE = 1024
const JPEG_QUALITY = 0.8
/** Limite do resultado final (o banco guarda o texto base64). */
export const MAX_CHAT_IMAGE_OUTPUT_CHARS = 700 * 1024

const SIGNATURES = [
  { type: 'jpeg', bytes: [0xff, 0xd8, 0xff] },
  { type: 'png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { type: 'gif', bytes: [0x47, 0x49, 0x46, 0x38] }
]

/** Identifica o formato real pelos primeiros bytes. Retorna null se não for imagem suportada. */
export function detectImageType(bytes) {
  for (const sig of SIGNATURES) {
    if (sig.bytes.every((b, i) => bytes[i] === b)) return sig.type
  }
  // WEBP: "RIFF" .... "WEBP"
  const isRiff = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
  const isWebp = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  if (isRiff && isWebp) return 'webp'
  return null
}

const SAFE_IMAGE_RE = /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/

/** Só renderizamos imagens que vieram do nosso próprio processo de higienização. */
export function isSafeChatImage(value) {
  return typeof value === 'string' && value.length <= MAX_CHAT_IMAGE_OUTPUT_CHARS * 1.1 && SAFE_IMAGE_RE.test(value)
}

/**
 * Valida e higieniza uma imagem escolhida pelo usuário.
 * @param {File} file
 * @returns {Promise<string>} data URL JPEG limpa
 */
export async function sanitizeChatImage(file) {
  if (!file) throw new Error('Nenhuma imagem selecionada.')
  if (file.size > MAX_CHAT_IMAGE_INPUT_BYTES) {
    throw new Error('A imagem é muito grande. Envie uma foto de até 5 MB.')
  }

  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  if (!detectImageType(header)) {
    throw new Error('Arquivo não permitido. Envie apenas fotos (JPG, PNG, GIF ou WEBP).')
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Não foi possível ler a imagem. O arquivo pode estar corrompido.'))
      el.src = objectUrl
    })

    if (!img.naturalWidth || !img.naturalHeight) {
      throw new Error('Imagem inválida.')
    }

    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
    const width = Math.round(img.naturalWidth * scale)
    const height = Math.round(img.naturalHeight * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)

    let quality = JPEG_QUALITY
    let dataUrl = canvas.toDataURL('image/jpeg', quality)
    while (dataUrl.length > MAX_CHAT_IMAGE_OUTPUT_CHARS && quality > 0.4) {
      quality -= 0.1
      dataUrl = canvas.toDataURL('image/jpeg', quality)
    }
    if (!isSafeChatImage(dataUrl)) {
      throw new Error('Não foi possível preparar a imagem para envio.')
    }
    return dataUrl
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
