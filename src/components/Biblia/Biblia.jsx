import { useState } from 'react'
import { LIVROS_BIBLIA } from './constants'
import './Biblia.css'

/**
 * Componente que exibe a Bíblia Digital com busca, seleção de capítulos e leitura de versículos.
 */
export default function Biblia() {
  const [livros] = useState(LIVROS_BIBLIA)
  const [livroSelecionado, setLivroSelecionado] = useState(null)
  const [capituloSelecionado, setCapituloSelecionado] = useState(null)
  const [versiculos, setVersiculos] = useState([])
  const [loading, setLoading] = useState(false)
  const [busca, setBusca] = useState('')

  const handleLivroClick = (livro) => {
    setLivroSelecionado(livro)
    setCapituloSelecionado(null)
    setVersiculos([])
    setBusca('')
  }

  const handleCapituloClick = async (capitulo) => {
    setLoading(true)
    try {
      const bookId = livros.findIndex(l => l.id === livroSelecionado.id) + 1;

      // Usando a API Bolls Life com a tradução NVT
      const res = await fetch(`https://bolls.life/get-chapter/NVT/${bookId}/${capitulo}/`)
      if (res.ok) {
        const data = await res.json()
        setVersiculos(data)
        setCapituloSelecionado(capitulo)
      } else {
        alert('Erro ao carregar versículos. Tente novamente mais tarde.')
      }
    } catch (error) {
      console.error('Erro ao buscar versículos:', error)
      alert('Erro de conexão ao buscar Bíblia.')
    } finally {
      setLoading(false)
    }
  }

  const handleVoltar = () => {
    if (capituloSelecionado) {
      setCapituloSelecionado(null)
      setVersiculos([])
    } else if (livroSelecionado) {
      setLivroSelecionado(null)
    }
  }

  const resultadosBusca = busca ?
    livros.filter(livro =>
      livro.name.toLowerCase().includes(busca.toLowerCase())
    ) : livros

  // RENDERIZAÇÃO: NÍVEL 3 (LEITURA DE VERSÍCULOS)
  if (livroSelecionado && capituloSelecionado) {
    const isFirstChapter = capituloSelecionado === 1
    const isLastChapter = capituloSelecionado === livroSelecionado.chapters

    return (
      <div className="page leitura-page">
        <div className="top-header-bar">
          <img src="/icr-logo.png" alt="ICR Logo" className="header-logo" />
          <span className="header-title">Igreja Cristã Renovada</span>
        </div>
        <header className="biblia-header-nav">
          <button onClick={handleVoltar} className="back-btn-biblia">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Voltar
          </button>

          <div className="leitura-header-center">
            <h2>{livroSelecionado.name} {capituloSelecionado}</h2>
            <div className="capitulo-nav-controls">
              <button
                onClick={() => handleCapituloClick(capituloSelecionado - 1)}
                disabled={isFirstChapter}
                className="nav-arrow-btn"
                title="Capítulo Anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button
                onClick={() => handleCapituloClick(capituloSelecionado + 1)}
                disabled={isLastChapter}
                className="nav-arrow-btn"
                title="Próximo Capítulo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </header>

        <div className="leitura-container">
          {loading ? (
            <div className="loading-state">Carregando leitura...</div>
          ) : (
            <div className="versiculos-list">
              {versiculos.map(v => (
                <div key={v.verse} className="versiculo-item">
                  <sup className="v-num">{v.verse}</sup>
                  <span className="v-text" dangerouslySetInnerHTML={{ __html: v.text }}></span>
                </div>
              ))}

              <div className="leitura-capitulo-nav">
                <button
                  onClick={() => handleCapituloClick(capituloSelecionado - 1)}
                  disabled={isFirstChapter}
                  className="capitulo-btn-nav"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Capítulo Anterior
                </button>
                <button
                  onClick={() => handleCapituloClick(capituloSelecionado + 1)}
                  disabled={isLastChapter}
                  className="capitulo-btn-nav"
                >
                  Próximo Capítulo
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // RENDERIZAÇÃO: NÍVEL 2 (ESCOLHA DE CAPÍTULOS)
  if (livroSelecionado && !capituloSelecionado) {
    const caps = Array.from({ length: livroSelecionado.chapters }, (_, i) => i + 1)

    return (
      <div className="page">
        <div className="top-header-bar">
          <img src="/icr-logo.png" alt="ICR Logo" className="header-logo" />
          <span className="header-title">Igreja Cristã Renovada</span>
        </div>
        <header className="biblia-header-nav">
          <button onClick={handleVoltar} className="back-btn-biblia">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Voltar
          </button>
          <h2>{livroSelecionado.name}</h2>
        </header>

        <div className="capitulos-secao">
          <p className="instrucao">Selecione o capítulo:</p>
          <div className="capitulos-grid">
            {caps.map(cap => (
              <button
                key={cap}
                className="capitulo-btn"
                onClick={() => handleCapituloClick(cap)}
              >
                {cap}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // RENDERIZAÇÃO: NÍVEL 1 (ESCOLHA DE LIVROS)
  return (
    <div className="page">
      <div className="top-header-bar">
        <img src="/icr-logo.png" alt="ICR Logo" className="header-logo" />
        <span className="header-title">Igreja Cristã Renovada</span>
      </div>
      <header className="page-header">
        <h1>Bíblia Sagrada</h1>
      </header>

      <div className="busca-container">
        <input
          type="text"
          placeholder="Buscar livro..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="busca-input"
        />
      </div>

      <div className="livros-secao">
        <div className="livros-grid">
          {resultadosBusca.map(livro => (
            <div
              key={livro.id}
              className="livro-item"
              onClick={() => handleLivroClick(livro)}
            >
              {livro.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
