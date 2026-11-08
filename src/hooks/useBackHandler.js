import { useEffect, useRef } from 'react'

/**
 * Botão "voltar" do celular (Chrome/Android, no app instalado ou no navegador).
 *
 * O Chrome só deixa `window.close()` fechar o app quando o histórico tem UMA entrada. Por isso, no celular:
 *  - toda navegação substitui a entrada atual (pushState vira replaceState);
 *  - o app guarda a própria pilha de telas (`backStack`);
 *  - o botão voltar é capturado por um CloseWatcher, sempre rearmado, e vai para o handler mais recente.
 * Em computadores (ou navegadores sem CloseWatcher) nada disso é ligado e o histórico funciona normal.
 */
const enabled =
  typeof window !== 'undefined' && 'CloseWatcher' in window && window.matchMedia?.('(pointer: coarse)').matches === true

const handlers = []
const backStack = []
let watcher = null

function armWatcher() {
  watcher?.destroy()
  watcher = new window.CloseWatcher()
  watcher.onclose = () => {
    armWatcher() // rearma antes de tudo: um segundo toque no voltar nunca fecha o app sem perguntar
    handlers[handlers.length - 1]?.()
  }
}

if (enabled) {
  window.history.pushState = window.history.replaceState.bind(window.history)
  armWatcher()
}

/** Chamado pelo App a cada navegação: telas principais zeram a pilha, telas filhas empilham a anterior. */
export function trackNavigation(pathname, previous, isMain) {
  if (isMain) backStack.length = 0
  else if (previous && previous !== pathname) backStack.push(previous)
}

/** Volta para a tela anterior (ou para o início, se não houver). */
export function goBack(navigate) {
  if (enabled) navigate(backStack.pop() ?? '/', { replace: true })
  else navigate(window.history.state?.idx > 0 ? -1 : '/')
}

export function exitApp() {
  window.close()
  // No navegador comum o close é bloqueado: sai do site voltando para a página anterior a ele.
  window.history.back()
}

/** O handler registrado por último tem prioridade (ex.: modal aberto > formulário com alterações > tela). */
export default function useBackHandler(active, handler) {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    if (!active) return undefined
    const run = () => handlerRef.current()
    handlers.push(run)
    return () => {
      handlers.splice(handlers.indexOf(run), 1)
    }
  }, [active])
}
