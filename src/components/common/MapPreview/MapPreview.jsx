import './MapPreview.css'

/**
 * Componente compartilhado para pré-visualização de mapa usando Google Maps iframe.
 *
 * @param {Object} props
 * @param {string} props.local - Endereço ou localização do evento.
 * @param {number} [props.height=180] - Altura do iframe do mapa.
 * @param {string} [props.title='Mapa do Evento'] - Título acessível do iframe do mapa.
 * @param {boolean} [props.showHint=false] - Indica se deve exibir a dica do marcador na parte inferior.
 */
export default function MapPreview({
  local,
  height = 180,
  title = 'Mapa do Evento',
  showHint = false
}) {
  if (!local) return null

  const encodedLocal = encodeURIComponent(local)
  const mapSrc = `https://maps.google.com/maps?q=${encodedLocal}&t=&z=15&ie=UTF8&iwloc=&output=embed`

  return (
    <div className={showHint ? "map-preview-container" : "map-preview-static"}>
      <iframe
        title={title}
        width="100%"
        height={height}
        frameBorder="0"
        scrolling={showHint ? "no" : "yes"}
        marginHeight="0"
        marginWidth="0"
        src={mapSrc}
      ></iframe>
      {showHint && <p className="map-hint">Verifique se o marcador está no local correto</p>}
    </div>
  )
}
