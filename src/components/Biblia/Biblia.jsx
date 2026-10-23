import { useState } from 'react'
import { LIVROS_BIBLIA } from './constants'
import { verseToPlainText } from '../../utils/sanitize'
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
  const [pastaAberta, setPastaAberta] = useState(null)
  const [erro, setErro] = useState('')

  const handleLivroClick = (livro) => {
    setLivroSelecionado(livro)
    setCapituloSelecionado(null)
    setVersiculos([])
    setErro('')
  }

  const handleCapituloClick = async (capitulo) => {
    setLoading(true)
    setErro('')
    try {
      const bookId = livros.findIndex(l => l.id === livroSelecionado.id) + 1

      // Usando a API Bolls Life com a tradução NVT
      const res = await fetch(`https://bolls.life/get-chapter/NVT/${bookId}/${capitulo}/`)
      const data = res.ok ? await res.json() : null
      if (!Array.isArray(data)) throw new Error(`Resposta inesperada da API (status ${res.status})`)
      // O texto vem de um serviço de terceiros: vira texto puro, nunca é injetado como HTML.
      setVersiculos(data.map(v => ({ verse: v.verse, text: verseToPlainText(v.text) })))
      setCapituloSelecionado(capitulo)
    } catch (error) {
      console.error('Erro ao buscar versículos:', error)
      setErro('Não foi possível carregar este capítulo. Verifique sua internet e tente novamente.')
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

  // RENDERIZAÇÃO: NÍVEL 3 (LEITURA DE VERSÍCULOS)
  if (livroSelecionado && capituloSelecionado) {
    const isFirstChapter = capituloSelecionado === 1
    const isLastChapter = capituloSelecionado === livroSelecionado.chapters

    return (
      <div className="page leitura-page">
        <div className="top-header-bar">
          <img src={`${import.meta.env.BASE_URL}icr-logo.png`} alt="ICR Logo" className="header-logo" />
          <span className="header-title">Igreja Cristã Renovada</span>
        </div>
        <header className="page-header">
          <button onClick={handleVoltar} className="back-btn" aria-label="Voltar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>

          <div className="leitura-header-center">
            <h1>{livroSelecionado.name} {capituloSelecionado}</h1>
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
          {erro && <p className="instrucao" role="alert">{erro}</p>}
          {loading ? (
            <div className="loading-state">Carregando leitura...</div>
          ) : (
            <div className="versiculos-list">
              {versiculos.map(v => (
                <div key={v.verse} className="versiculo-item">
                  <sup className="v-num">{v.verse}</sup>
                  <span className="v-text">{v.text}</span>
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
          <img src={`${import.meta.env.BASE_URL}icr-logo.png`} alt="ICR Logo" className="header-logo" />
          <span className="header-title">Igreja Cristã Renovada</span>
        </div>
        <header className="page-header">
          <button onClick={handleVoltar} className="back-btn" aria-label="Voltar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <h1>{livroSelecionado.name}</h1>
        </header>

        <div className="capitulos-secao">
          {erro && <p className="instrucao" role="alert">{erro}</p>}
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

  // RENDERIZAÇÃO: NÍVEL 1 (PASTAS DOS TESTAMENTOS + LIVROS)
  const termo = busca.trim().toLowerCase()
  const testamentos = [
    { id: 'at', nome: 'Antigo Testamento', livros: livros.slice(0, 39) },
    { id: 'nt', nome: 'Novo Testamento', livros: livros.slice(39) }
  ].map(t => ({
    ...t,
    filtrados: termo ? t.livros.filter(l => l.name.toLowerCase().includes(termo)) : t.livros
  }))
  const semResultados = termo && testamentos.every(t => t.filtrados.length === 0)

  return (
    <div className="page">
      <div className="top-header-bar">
        <img src={`${import.meta.env.BASE_URL}icr-logo.png`} alt="ICR Logo" className="header-logo" />
        <span className="header-title">Igreja Cristã Renovada</span>
      </div>
      <header className="page-header">
        <h1>Bíblia Sagrada</h1>
      </header>

      <div className="busca-container">
        <svg className="busca-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input
          type="search"
          placeholder="Buscar livro..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="busca-input"
          aria-label="Buscar livro"
        />
      </div>

      <div className="livros-secao">
        {semResultados && <p className="instrucao">Nenhum livro encontrado para "{busca}".</p>}
        {testamentos.map(t => {
          if (termo && t.filtrados.length === 0) return null
          // Durante a busca, as pastas com resultado abrem sozinhas.
          const aberto = termo ? true : pastaAberta === t.id
          return (
            <section key={t.id} className={`testamento-pasta ${aberto ? 'aberta' : ''}`}>
              <button
                type="button"
                className="testamento-header"
                onClick={() => setPastaAberta(aberto && !termo ? null : t.id)}
                aria-expanded={aberto}
              >
                <span className="testamento-icon" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                </span>
                <span className="testamento-text">
                  <strong>{t.nome}</strong>
                  <small>
                    {termo ? `${t.filtrados.length} de ${t.livros.length} livros` : `${t.livros.length} livros`}
                  </small>
                </span>
                <svg className="testamento-chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {aberto && (
                <div className="livros-grid testamento-livros">
                  {t.filtrados.map(livro => (
                    <div
                      key={livro.id}
                      className="livro-item"
                      onClick={() => handleLivroClick(livro)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleLivroClick(livro) }}
                    >
                      {livro.name}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
