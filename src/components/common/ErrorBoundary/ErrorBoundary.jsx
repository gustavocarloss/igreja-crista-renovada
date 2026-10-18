import { Component } from 'react'
import ErrorState from '../ErrorState/ErrorState'

/**
 * Última linha de defesa: se algum componente quebrar ao renderizar, o usuário vê
 * uma tela amigável com botão de recarregar em vez de uma tela branca.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Erro inesperado na interface', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          fullScreen
          title="Algo deu errado"
          message="Ocorreu um erro inesperado. Recarregue o aplicativo para continuar."
          retryLabel="Recarregar"
          onRetry={() => window.location.reload()}
        />
      )
    }
    return this.props.children
  }
}
