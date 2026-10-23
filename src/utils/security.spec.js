import { describe, it, expect } from 'vitest'
import { safeHttpUrl, verseToPlainText } from './sanitize'
import { isSafeAvatar, safeAvatar } from './image'
import { isSafeChatImage, detectImageType } from './chatImage'
import { isStrongPassword, isValidEmail } from './validation'
import { mapEventRow, eventToRow } from './events'

describe('safeHttpUrl', () => {
  it('aceita links http(s)', () => {
    expect(safeHttpUrl('https://youtube.com/live/abc')).toBe('https://youtube.com/live/abc')
    expect(safeHttpUrl('  http://exemplo.com  ')).toBe('http://exemplo.com/')
  })

  it.each(['javascript:alert(1)', ' JavaScript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:x', 'exemplo.com', '', null, 42])(
    'bloqueia %s',
    (value) => {
      expect(safeHttpUrl(value)).toBeNull()
    }
  )
})

describe('verseToPlainText', () => {
  it('remove tags e scripts, mantendo só texto', () => {
    const text = verseToPlainText('No princípio<S>7225</S> <img src=x onerror=alert(1)>criou<script>x</script>')
    expect(text).not.toMatch(/<|onerror/)
    expect(text).toContain('No princípio')
  })

  it('converte <br> em quebra de linha e decodifica entidades', () => {
    expect(verseToPlainText('a<br/>b &amp; c')).toBe('a\nb & c')
  })
})

describe('avatar seguro', () => {
  it('aceita data URLs raster em base64', () => {
    expect(isSafeAvatar('data:image/jpeg;base64,QUJD')).toBe(true)
    expect(isSafeAvatar('data:image/png;base64,QUJD==')).toBe(true)
  })

  it.each([
    'https://rastreador.exemplo/pixel.png',
    'data:image/svg+xml;base64,PHN2Zz4=',
    'data:image/jpeg;base64,QUJD"); background: url(https://x',
    'data:text/html;base64,QUJD',
    null
  ])('rejeita %s', (value) => {
    expect(isSafeAvatar(value)).toBe(false)
    expect(safeAvatar(value)).toBeNull()
  })

  it('imagem do chat só aceita JPEG', () => {
    expect(isSafeChatImage('data:image/jpeg;base64,QUJD')).toBe(true)
    expect(isSafeChatImage('data:image/png;base64,QUJD')).toBe(false)
  })

  it('detecta o formato real pelos magic bytes', () => {
    expect(detectImageType([0xff, 0xd8, 0xff, 0xe0])).toBe('jpeg')
    expect(detectImageType([0x4d, 0x5a, 0x90, 0x00])).toBeNull() // executável .exe
  })
})

describe('validação', () => {
  it('senha forte: 8+ caracteres com letras e números', () => {
    expect(isStrongPassword('senha123')).toBe(true)
    expect(isStrongPassword('12345678')).toBe(false)
    expect(isStrongPassword('abc123')).toBe(false)
  })

  it('e-mail', () => {
    expect(isValidEmail('nome@igreja.com')).toBe(true)
    expect(isValidEmail('nome@igreja')).toBe(false)
  })
})

describe('eventos', () => {
  it('link perigoso vindo do banco não é exibido', () => {
    const evento = mapEventRow({ id: 1, meeting_link: 'javascript:alert(1)', meeting_date: null })
    expect(evento.link).toBeNull()
    expect(evento.aoVivo).toBe(false)
  })

  it('link perigoso não é gravado', () => {
    const row = eventToRow({ nome: 'Culto', local: 'Templo', data: '2030-01-01', hora: '10:00', link: 'javascript:alert(1)' })
    expect(row.meeting_link).toBeNull()
  })
})
