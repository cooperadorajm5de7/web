# Página de la Cooperadora — Jardín Maternal 5 D.E. 7

Sitio estático en React + Vite, sin backend, publicado con GitHub Pages.
Tiene dos páginas: **Inicio** (cuota, transferencia, contacto) y **Emprendimientos** (`#/emprendimientos`),
que se completa sola desde un Google Sheet.

## Editar el contenido fijo

Cuota, datos bancarios, descripción, mail e Instagram están en **`src/data/coope.json`**.
Se puede editar desde GitHub (ícono del lápiz). Al guardar en `main`, la página se publica sola en 1–2 minutos.

## Emprendimientos desde Google Forms + Sheets

### 1. Crear el formulario
Crear un Google Form con estas preguntas (los títulos tienen que coincidir con `columnas` en `coope.json`,
aunque no importan mayúsculas ni acentos):

| Pregunta                    | Tipo               |
|-----------------------------|--------------------|
| Nombre del emprendimiento   | Respuesta corta    |
| Descripción                 | Párrafo            |
| Contacto                    | Respuesta corta (Instagram, WhatsApp, mail o web) |
| Foto                        | Subir archivos (1 imagen) |

En **Respuestas → Vincular con Hojas de cálculo** se crea la planilla.

### 2. Columna para aprobar (recomendado)
En la planilla, agregar a mano una columna al final llamada **`Publicar`**.
Solo se muestran las filas donde dice `Sí`. Así nada aparece en la página sin que alguien de la coope lo revise.
Si no existe la columna, se muestran todas las respuestas.

### 3. Publicar la planilla como CSV
**Archivo → Compartir → Publicar en la Web** → elegir la hoja de respuestas → formato **CSV** → Publicar.
Copiar el link y pegarlo en `coope.json` → `emprendimientos.sheetCsvUrl`.
Los cambios en la planilla pueden tardar unos minutos en verse en la página.

### 4. Fotos
Las fotos que suben las familias quedan en una carpeta de Google Drive del dueño del formulario
(se llama como el formulario, con "(File responses)").
Para que se vean en la página: **compartir esa carpeta como "Cualquier persona con el vínculo: Lector"**.
Si una foto no carga, se muestra la inicial del emprendimiento.

> Ojo: en Google Forms, la pregunta de subir archivos obliga a quien responde a iniciar sesión con una cuenta de Google.

### 5. Link al formulario
Pegar el link del formulario en `emprendimientos.formularioUrl` y aparece el botón "Sumá tu emprendimiento".

Mientras `sheetCsvUrl` esté vacío, la página muestra los `ejemplos` del JSON.

## Correr localmente

```bash
npm install
npm run dev
```

## Publicar en GitHub Pages (una sola vez)

1. Crear el repo en GitHub y subir este proyecto a la rama `main`.
2. En el repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada push a `main` corre `.github/workflows/deploy.yml` y publica en `https://<usuario>.github.io/<repo>/`.
