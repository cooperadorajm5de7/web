import Papa from 'papaparse'

/**
 * Lee las respuestas del formulario desde un Google Sheet publicado como CSV
 * (Archivo → Compartir → Publicar en la Web → hoja de respuestas → CSV).
 */
export async function cargarEmprendimientos(config) {
  if (!config.sheetCsvUrl) {
    return { items: config.ejemplos.map(normalizar), esEjemplo: true }
  }

  const res = await fetch(config.sheetCsvUrl, { cache: 'no-store' })
  if (!res.ok) throw new Error(`No se pudo leer la planilla (${res.status})`)
  const texto = await res.text()

  const { data } = Papa.parse(texto, { header: true, skipEmptyLines: true })
  const col = config.columnas
  const tieneColumnaPublicar = data.length > 0 && buscar(data[0], col.publicar) !== undefined

  const items = data
    // Si existe la columna "Publicar", solo se muestran las filas aprobadas
    .filter((fila) => !tieneColumnaPublicar || esSi(buscar(fila, col.publicar)))
    .map((fila) =>
      normalizar({
        nombre: buscar(fila, col.nombre),
        descripcion: buscar(fila, col.descripcion),
        contacto: buscar(fila, col.contacto),
        foto: buscar(fila, col.foto),
      }),
    )
    .filter((e) => e.nombre)

  return { items, esEjemplo: false }
}

// Busca la columna ignorando mayúsculas, acentos y espacios extra
function buscar(fila, nombreColumna) {
  if (!nombreColumna) return undefined
  const clave = simplificar(nombreColumna)
  const encontrada = Object.keys(fila).find((k) => simplificar(k) === clave)
  return encontrada ? fila[encontrada] : undefined
}

function simplificar(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
}

function esSi(valor = '') {
  return ['si', 'sí', 'x', 'true', 'verdadero', '1'].includes(simplificar(valor))
}

function normalizar(e) {
  const contacto = (e.contacto || '').trim()
  return {
    nombre: (e.nombre || '').trim(),
    descripcion: (e.descripcion || '').trim(),
    contactoTexto: contacto,
    contactoLink: linkDeContacto(contacto),
    foto: urlDeFoto(e.foto),
  }
}

// Convierte lo que haya escrito la familia en un link usable
function linkDeContacto(c) {
  if (!c) return null
  if (/^https?:\/\//i.test(c)) return c
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) return `mailto:${c}`
  if (/^@[\w.]+$/.test(c)) return `https://instagram.com/${c.slice(1)}`
  if (/^(www\.|instagram\.com|wa\.me|facebook\.com)/i.test(c)) return `https://${c}`
  const digitos = c.replace(/\D/g, '')
  if (digitos.length >= 10) {
    // Teléfonos argentinos → WhatsApp
    const sinCero = digitos.replace(/^0/, '').replace(/^(\d{2,4})15/, '$1')
    const numero = sinCero.startsWith('54') ? sinCero : `549${sinCero}`
    return `https://wa.me/${numero}`
  }
  return null
}

// Las fotos subidas por Google Forms quedan como links de Drive;
// las transformamos en una URL de imagen que se puede mostrar
function urlDeFoto(valor) {
  if (!valor) return null
  const primera = valor.split(',')[0].trim()
  const id = primera.match(/[?&]id=([\w-]+)/)?.[1] || primera.match(/\/d\/([\w-]+)/)?.[1]
  if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w800`
  if (/^https?:\/\//i.test(primera)) return primera
  return null
}
