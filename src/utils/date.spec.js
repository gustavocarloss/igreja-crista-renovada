import { describe, it, expect } from 'vitest'
import { extractLocalDateAndTime } from './date'

describe('Utilitários de Data - extractLocalDateAndTime', () => {
  it('deve retornar valores vazios se nenhuma data for fornecida', () => {
    expect(extractLocalDateAndTime(null)).toEqual({ data: '', hora: '' })
    expect(extractLocalDateAndTime(undefined)).toEqual({ data: '', hora: '' })
    expect(extractLocalDateAndTime('')).toEqual({ data: '', hora: '' })
  })

  it('deve extrair corretamente a data e hora local', () => {
    // Usando uma data fixa para teste (UTC)
    const testDate = '2026-08-30T15:30:00.000Z'
    const result = extractLocalDateAndTime(testDate)
    
    // O resultado local pode variar com base no fuso horário do executor do teste,
    // mas a estrutura de saída deve sempre corresponder a YYYY-MM-DD e HH:mm.
    expect(result.data).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(result.hora).toMatch(/^\d{2}:\d{2}$/)
  })
})
