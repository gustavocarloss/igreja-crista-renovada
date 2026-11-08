import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render } from '@testing-library/react'

// Simula o Chrome do celular: CloseWatcher disponível e tela de toque.
const watchers = []
class FakeCloseWatcher {
  constructor() {
    watchers.push(this)
  }
  destroy() {}
}
const pressBack = () => watchers[watchers.length - 1].onclose()

let useBackHandler, trackNavigation, goBack
beforeAll(async () => {
  vi.stubGlobal('CloseWatcher', FakeCloseWatcher)
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
  ;({ default: useBackHandler, trackNavigation, goBack } = await import('./useBackHandler'))
})

function Tela({ active, onBack }) {
  useBackHandler(active, onBack)
  return null
}

describe('useBackHandler', () => {
  it('não cria entradas no histórico (condição para o app conseguir se fechar)', () => {
    const before = window.history.length
    window.history.pushState({}, '', '/detalhes/1')
    expect(window.history.length).toBe(before)
  })

  it('chama o handler mais recente e rearma o voltar a cada toque', () => {
    const principal = vi.fn()
    const filha = vi.fn()
    const { rerender } = render(<><Tela active onBack={principal} /><Tela active onBack={filha} /></>)
    pressBack()
    expect(filha).toHaveBeenCalledTimes(1)

    rerender(<><Tela active onBack={principal} /><Tela active={false} onBack={filha} /></>)
    pressBack()
    expect(principal).toHaveBeenCalledTimes(1)
  })

  it('volta pela pilha própria e zera a pilha ao chegar numa tela principal', () => {
    const navigate = vi.fn()
    trackNavigation('/detalhes/1', '/calendario', false)
    goBack(navigate)
    expect(navigate).toHaveBeenLastCalledWith('/calendario', { replace: true })

    trackNavigation('/detalhes/1', '/', false)
    trackNavigation('/perfil', '/detalhes/1', true)
    goBack(navigate)
    expect(navigate).toHaveBeenLastCalledWith('/', { replace: true })
  })
})
