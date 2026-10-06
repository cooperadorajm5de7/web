import { useEffect, useState } from 'react'
import data from './data/coope.json'
import { cargarEmprendimientos } from './emprendimientos.js'

const LOGO = `${import.meta.env.BASE_URL}logo.png`

// Navegación por hash (#/emprendimientos): funciona en GitHub Pages sin configuración extra
function useRuta() {
  const leer = () => (window.location.hash.replace(/^#\/?/, '') || 'inicio')
  const [ruta, setRuta] = useState(leer)
  useEffect(() => {
    const onChange = () => {
      setRuta(leer())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return ruta
}

function irA(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function Menu({ ruta }) {
  const [abierto, setAbierto] = useState(false)
  const links = [
    { href: '#/', id: 'inicio', texto: 'Inicio' },
    { href: '#/emprendimientos', id: 'emprendimientos', texto: 'Emprendimientos' },
  ]
  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <a href="#/" className="marca">
          <img src={LOGO} alt="" width="44" height="44" />
          <span>
            <strong>{data.nombreCoope}</strong>
            <small>{data.nombreJardin}</small>
          </span>
        </a>
        <button
          type="button"
          className="hamburguesa"
          aria-label="Abrir menú"
          aria-expanded={abierto}
          onClick={() => setAbierto(!abierto)}
        >
          <span /><span /><span />
        </button>
        <nav className={abierto ? 'menu abierto' : 'menu'}>
          {links.map((l) => (
            <a
              key={l.id}
              href={l.href}
              className={ruta === l.id ? 'activo' : ''}
              onClick={() => setAbierto(false)}
            >
              {l.texto}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* si el navegador no deja copiar, el dato igual queda visible */
    }
  }
  return (
    <div className="dato">
      <span className="dato-label">{label}</span>
      <span className="dato-valor">{value}</span>
      <button type="button" className="copiar" onClick={copy} aria-label={`Copiar ${label}`}>
        {copied ? '¡Copiado!' : 'Copiar'}
      </button>
    </div>
  )
}

function Dato({ label, value }) {
  if (!value) return null
  return (
    <div className="dato">
      <span className="dato-label">{label}</span>
      <span className="dato-valor">{value}</span>
    </div>
  )
}

function Inicio() {
  const { nombreCoope, nombreJardin, descripcion, cuota, transferencia, contacto } = data
  const ig = contacto.instagram.replace(/^@/, '')

  return (
    <>
      <section className="hero">
        <div className="wrap hero-inner">
          <div>
            <p className="kicker">{nombreJardin}</p>
            <h1>{nombreCoope}</h1>
            <p className="lead">{descripcion}</p>
            <div className="acciones">
              <button type="button" className="btn" onClick={() => irA('cuota')}>Pagar la cuota</button>
              <button type="button" className="btn btn-ghost" onClick={() => irA('contacto')}>Contacto</button>
            </div>
          </div>
          <img className="hero-logo" src={LOGO} alt={`Logo ${nombreCoope} ${nombreJardin}`} />
        </div>
      </section>

      <main className="wrap contenido">
        <section id="cuota" className="card destacada">
          <h2>Cuota de la cooperadora</h2>
          <p className="monto">
            {cuota.monto} <span>{cuota.periodo}</span>
          </p>
          {cuota.nota && <p className="nota">{cuota.nota}</p>}

          <h3>Datos para transferir</h3>
          <div className="datos">
            <CopyRow label="Alias" value={transferencia.alias} />
            <CopyRow label="CBU" value={transferencia.cbu} />
            <Dato label="Titular" value={transferencia.titular} />
            <Dato label="Banco" value={transferencia.banco} />
            <Dato label="CUIT" value={transferencia.cuit} />
          </div>
          {transferencia.indicaciones && <p className="aviso">💡 {transferencia.indicaciones}</p>}
        </section>

        <section id="contacto" className="card">
          <h2>Contacto</h2>
          <div className="contactos">
            <a className="contacto" href={`mailto:${contacto.email}`}>
              <span className="icono" aria-hidden="true">✉️</span>
              <span><strong>Mail</strong><small>{contacto.email}</small></span>
            </a>
            <a className="contacto" href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer">
              <span className="icono" aria-hidden="true">📷</span>
              <span><strong>Instagram</strong><small>@{ig}</small></span>
            </a>
          </div>
        </section>

        <a href="#/emprendimientos" className="banner-empr">
          <span>
            <strong>Emprendimientos de las familias</strong>
            <small>Conocé lo que hacen las familias del jardín</small>
          </span>
          <span aria-hidden="true">→</span>
        </a>
      </main>
    </>
  )
}

function Emprendimientos() {
  const config = data.emprendimientos
  const [estado, setEstado] = useState({ cargando: true, items: [], error: null, esEjemplo: false })

  useEffect(() => {
    cargarEmprendimientos(config)
      .then(({ items, esEjemplo }) => setEstado({ cargando: false, items, error: null, esEjemplo }))
      .catch((err) => setEstado({ cargando: false, items: [], error: err.message, esEjemplo: false }))
  }, [config])

  return (
    <main className="wrap contenido">
      <div className="titulo-pagina">
        <h1>Emprendimientos de las familias</h1>
        <p>Familias del jardín que tienen un emprendimiento. ¡Apoyemos lo nuestro!</p>
        {config.formularioUrl && (
          <a className="btn" href={config.formularioUrl} target="_blank" rel="noopener noreferrer">
            + Sumá tu emprendimiento
          </a>
        )}
      </div>

      {config.disclaimer && (
        <p className="disclaimer">
          <strong>Importante:</strong> {config.disclaimer}
        </p>
      )}

      {estado.esEjemplo && (
        <p className="aviso">Estos son datos de ejemplo. Configurá la planilla en <code>coope.json</code>.</p>
      )}

      {estado.cargando && <p className="estado">Cargando emprendimientos…</p>}
      {estado.error && (
        <p className="estado">No pudimos cargar los emprendimientos en este momento. Probá de nuevo más tarde.</p>
      )}
      {!estado.cargando && !estado.error && estado.items.length === 0 && (
        <p className="estado">Todavía no hay emprendimientos cargados.</p>
      )}

      <ul className="grilla">
        {estado.items.map((e, i) => (
          <li key={`${e.nombre}-${i}`} className="empr">
            <div className="empr-foto">
              {e.foto ? (
                <img src={e.foto} alt={e.nombre} loading="lazy" referrerPolicy="no-referrer"
                  onError={(ev) => { ev.currentTarget.style.display = 'none' }} />
              ) : null}
              <span className="empr-inicial" aria-hidden="true">{e.nombre.charAt(0)}</span>
            </div>
            <div className="empr-cuerpo">
              <h2>{e.nombre}</h2>
              {e.descripcion && <p>{e.descripcion}</p>}
              {e.contactoTexto && (
                e.contactoLink ? (
                  <a href={e.contactoLink} target="_blank" rel="noopener noreferrer">{e.contactoTexto}</a>
                ) : (
                  <span className="empr-contacto">{e.contactoTexto}</span>
                )
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default function App() {
  const ruta = useRuta()
  return (
    <>
      <Menu ruta={ruta} />
      {ruta === 'emprendimientos' ? <Emprendimientos /> : <Inicio />}
      <footer>
        <div className="wrap">{data.nombreCoope} · {data.nombreJardin}</div>
      </footer>
    </>
  )
}
