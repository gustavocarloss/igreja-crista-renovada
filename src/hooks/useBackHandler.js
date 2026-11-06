import { useEffect, useRef } from 'react'

/**
 * Botão "voltar" do celular (Android) / do navegador.
 *
 * Enquanto houver um handler ativo, mantemos uma entrada extra ("trap") no histórico com a mesma URL.
 * Apertar voltar só remove essa entrada (a tela não muda) e chama o handler mais recente, que decide:
 * ficar (chamando `armBackTrap()` de novo) ou seguir em frente (navegar / sair do app).
 */
const handlers = []
let exiting = false

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', (e) => {
    if (exiting) return window.history.back()
    // Voltamos de uma tela filha para a entrada extra: nada a perguntar.
    if (e.state?.trap || !handlers.length) return
    handlers[handlers.length - 1]()
  })
}

export function armBackTrap() {
  if (!exiting && !window.history.state?.trap) window.history.pushState({ ...window.history.state, trap: true }, '')
}

/** Fecha o app instalado; no navegador, volta até sair do site. */
export function exitApp() {
  window.close() // só funciona quando o histórico tem apenas este documento (app instalado aberto do ícone)
  exiting = true
  window.history.back()
}

/** O handler registrado por último tem prioridade (ex.: formulário com alterações > tela principal). */
export default function useBackHandler(active, handler) {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    if (!active) return undefined
    const run = () => handlerRef.current()
    handlers.push(run)
    armBackTrap()
    return () => {
      handlers.splice(handlers.indexOf(run), 1)
    }
  }, [active])
}
