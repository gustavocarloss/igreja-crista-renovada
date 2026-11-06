import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import useBackHandler from './useBackHandler'

function Tela({ active, onBack }) {
  useBackHandler(active, onBack)
  return null
}

const pressBack = (state) => window.dispatchEvent(new PopStateEvent('popstate', { state }))

describe('useBackHandler', () => {
  it('cria a entrada extra no histórico e chama o handler mais recente ao voltar', () => {
    const principal = vi.fn()
    const filha = vi.fn()
    const { rerender } = render(<><Tela active onBack={principal} /><Tela active={false} onBack={filha} /></>)
    expect(window.history.state?.trap).toBe(true)

    rerender(<><Tela active onBack={principal} /><Tela active onBack={filha} /></>)
    pressBack(null)
    expect(filha).toHaveBeenCalledTimes(1)
    expect(principal).not.toHaveBeenCalled()

    rerender(<><Tela active onBack={principal} /><Tela active={false} onBack={filha} /></>)
    pressBack(null)
    expect(principal).toHaveBeenCalledTimes(1)
  })

  it('ignora a volta de uma tela filha para a entrada extra', () => {
    const handler = vi.fn()
    render(<Tela active onBack={handler} />)
    pressBack({ trap: true })
    expect(handler).not.toHaveBeenCalled()
  })
})
