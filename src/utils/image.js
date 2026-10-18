/**
 * Utilitários de imagem de perfil.
 */

const MAX_INPUT_BYTES = 8 * 1024 * 1024

/**
 * Lê uma imagem escolhida pelo usuário, recorta em quadrado e reduz para `size`x`size` (JPEG).
 * Resultado típico: 10–30 KB em vez de vários MB — importante para celular e para o banco.
 *
 * @param {File} file
 * @param {number} [size=256]
 * @returns {Promise<string>} data URL (image/jpeg)
 */
export async function resizeImageToDataUrl(file, size = 256) {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    throw new Error('Selecione um arquivo de imagem válido.')
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('A imagem é muito grande. Escolha uma foto de até 8 MB.')
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
