import './MapPreview.css'

/** Link oficial do Google Maps (no celular abre direto o app do Maps). */
const googleMapsUrl = (local) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(local)}`

/**
 * Componente compartilhado para pré-visualização de mapa usando Google Maps iframe.
 *
 * @param {Object} props
 * @param {string} props.local - Endereço ou localização do evento.
 * @param {number} [props.height=180] - Altura do iframe do mapa.
 * @param {string} [props.title='Mapa do Evento'] - Título acessível do iframe do mapa.
 * @param {boolean} [props.showHint=false] - Indica se deve exibir a dica do marcador na parte inferior.
 * @param {boolean} [props.linkToMaps=false] - Se true, tocar em qualquer parte do mapa abre o Google Maps.
 */
export default function MapPreview({
  local,
  height = 180,
  title = 'Mapa do Evento',
  showHint = false,
  linkToMaps = false
}) {
  if (!local) return null

  const encodedLocal = encodeURIComponent(local)
  const mapSrc = `https://maps.google.com/maps?q=${encodedLocal}&t=&z=15&ie=UTF8&iwloc=&output=embed`

  return (
    <div className={`${showHint ? 'map-preview-container' : 'map-preview-static'} ${linkToMaps ? 'map-clickable' : ''}`}>
      <iframe
        title={title}
        width="100%"
        height={height}
        frameBorder="0"
        scrolling={showHint || linkToMaps ? 'no' : 'yes'}
        marginHeight="0"
        marginWidth="0"
        src={mapSrc}
        tabIndex={linkToMaps ? -1 : undefined}
      ></iframe>
      {linkToMaps && (
        // O iframe não deixa capturar o clique, então uma camada transparente por cima faz o papel de link.
        <a
          href={googleMapsUrl(local)}
          target="_blank"
          rel="noopener noreferrer"
          className="map-click-overlay"
          aria-label={`Abrir ${local} no Google Maps`}
        >
          <span className="map-click-chip">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            Abrir no Maps
          </span>
        </a>
      )}
      {showHint && <p className="map-hint">Verifique se o marcador está no local correto</p>}
    </div>
  )
}
