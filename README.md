![logo_ironhack_blue 7](https://user-images.githubusercontent.com/23629340/40541063-a07a0a8a-601a-11e8-91b5-2f13e4e6b441.png)

# Lab | Tu Primer Servidor — API de Películas

### Requisitos

* Haz un fork de este repositorio
* Clona este repositorio

### Entrega

* Al finalizar, ejecuta los siguientes comandos:

```
git add .
git commit -m "done"
git push origin [master/main]
```

* Crea un Pull Request y envía tu entrega.

## Objetivo

Crear un servidor Express desde cero que gestione una colección de películas en memoria. Al terminar este lab tendrás un servidor HTTP funcional con varias rutas y comprenderás cómo funcionan `req`, `res`, los métodos HTTP y los códigos de estado.

## Requisitos previos

- Node.js v18+ instalado (`node --version`)
- npm instalado (`npm --version`)
- Postman o Thunder Client (extensión de VS Code)
- Haber leído el material del D1

## Lo que vas a construir

Una API que permite:
- Listar todas las películas
- Buscar una película por ID
- Buscar películas por género
- Añadir una nueva película
- Calcular la nota media de todas las películas

Los datos vivirán **en memoria** (un array de JavaScript), sin base de datos todavía.

### Paso 1: Inicializar el proyecto

```bash
mkdir api-peliculas
cd api-peliculas
npm init -y
```

Verifica que se creó `package.json`. Instala las dependencias:

```bash
npm install express dotenv
npm install --save-dev nodemon
```

Abre `package.json` y añade los scripts:

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

**Comprobación**: `cat package.json` debe mostrar `express` en dependencies y `nodemon` en devDependencies.

### Paso 2: Crear el archivo .env y .gitignore

Crea `.env` en la raíz del proyecto:

```
PORT=3000
```

Crea `.gitignore`:

```
node_modules/
.env
```

### Paso 3: Crear los datos iniciales

Crea el archivo `index.js` con estos datos de ejemplo. **No copies los datos tal cual** — añade al menos 2 películas más de tu elección:

```javascript
require('dotenv').config()
const express = require('express')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware para parsear JSON
app.use(express.json())

// =====================
// DATOS EN MEMORIA
// =====================
let peliculas = [
  {
    id: 1,
    titulo: 'Inception',
    director: 'Christopher Nolan',
    anio: 2010,
    genero: 'ciencia-ficcion',
    nota: 8.8
  },
  {
    id: 2,
    titulo: 'Pulp Fiction',
    director: 'Quentin Tarantino',
    anio: 1994,
    genero: 'crimen',
    nota: 8.9
  },
  {
    id: 3,
    titulo: 'El Señor de los Anillos',
    director: 'Peter Jackson',
    anio: 2001,
    genero: 'fantasia',
    nota: 8.8
  }
  // Añade aquí 2 películas más de tu elección
]

let nextId = 4  // Contador para asignar IDs únicos

// =====================
// RUTAS (las añadirás abajo)
// =====================


// =====================
// INICIAR SERVIDOR
// =====================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
```

### Paso 4: Ruta GET /peliculas — listar todas

Añade esta ruta **antes** de `app.listen`:

```javascript
// GET /peliculas → devuelve todas las películas
app.get('/peliculas', (req, res) => {
  res.json(peliculas)
})
```

**Prueba**: Arranca el servidor con `npm run dev`. En Postman o el navegador visita `http://localhost:3000/peliculas`. Debes ver el array completo.

### Paso 5: Ruta GET /peliculas/:id — buscar por ID

```javascript
// GET /peliculas/:id → devuelve una película por ID
app.get('/peliculas/:id', (req, res) => {
  const id = Number(req.params.id)
  const pelicula = peliculas.find(p => p.id === id)

  if (!pelicula) {
    return res.status(404).json({ error: 'Película no encontrada' })
  }

  res.json(pelicula)
})
```

**Prueba**:
- `GET /peliculas/1` → debe devolver Inception con status 200
- `GET /peliculas/99` → debe devolver `{ "error": "Película no encontrada" }` con status 404

> **Importante**: Fíjate en el `Number(req.params.id)`. Los parámetros de ruta siempre llegan como string. Si no conviertes, la comparación `p.id === id` fallará porque compara número con string.

### Paso 6: Ruta GET /peliculas con filtro por género

Modifica la ruta que ya tienes para soportar un query string opcional:

```javascript
// GET /peliculas?genero=crimen → filtra por género
app.get('/peliculas', (req, res) => {
  const { genero } = req.query

  if (genero) {
    const filtradas = peliculas.filter(p => p.genero === genero)
    return res.json(filtradas)
  }

  res.json(peliculas)
})
```

**Prueba**:
- `GET /peliculas` → todas las películas
- `GET /peliculas?genero=ciencia-ficcion` → solo las de ese género
- `GET /peliculas?genero=terror` → array vacío `[]` (sin error, eso es correcto)

### Paso 7: Ruta POST /peliculas — crear película

```javascript
// POST /peliculas → crea una nueva película
app.post('/peliculas', (req, res) => {
  const { titulo, director, anio, genero, nota } = req.body

  // Validación: campos obligatorios
  if (!titulo || !director || !anio || !genero) {
    return res.status(400).json({
      error: 'Los campos titulo, director, anio y genero son obligatorios'
    })
  }

  // Validación: nota debe ser entre 0 y 10
  if (nota !== undefined && (nota < 0 || nota > 10)) {
    return res.status(400).json({
      error: 'La nota debe estar entre 0 y 10'
    })
  }

  const nuevaPelicula = {
    id: nextId++,
    titulo,
    director,
    anio: Number(anio),
    genero,
    nota: nota !== undefined ? Number(nota) : null
  }

  peliculas.push(nuevaPelicula)

  // Status 201 = Created
  res.status(201).json(nuevaPelicula)
})
```

**Prueba en Postman**:

Request:
```
POST http://localhost:3000/peliculas
Content-Type: application/json

{
  "titulo": "Interstellar",
  "director": "Christopher Nolan",
  "anio": 2014,
  "genero": "ciencia-ficcion",
  "nota": 8.6
}
```

Debe devolver la película con un nuevo ID y status 201.

Prueba también el caso de error:
```json
{
  "titulo": "Película sin director"
}
```
Debe devolver status 400 con el mensaje de error.

### Paso 8: Ruta GET /estadisticas — nota media

```javascript
// GET /estadisticas → nota media de todas las películas
app.get('/estadisticas', (req, res) => {
  const conNota = peliculas.filter(p => p.nota !== null)

  if (conNota.length === 0) {
    return res.json({ media: null, total: 0 })
  }

  const suma = conNota.reduce((acc, p) => acc + p.nota, 0)
  const media = (suma / conNota.length).toFixed(2)

  res.json({
    media: Number(media),
    total: peliculas.length,
    conNota: conNota.length
  })
})
```

> **Atención al orden de las rutas**: Esta ruta debe declararse **antes** de `/peliculas/:id`. ¿Por qué? Porque si está después, Express interpretará `estadisticas` como el `:id` y buscará una película con ese ID. Compruébalo cambiando el orden y observa qué pasa.

**Prueba**: `GET /estadisticas` → algo como `{ "media": 8.83, "total": 5, "conNota": 5 }`

### Paso 9: Ruta DELETE /peliculas/:id

```javascript
// DELETE /peliculas/:id → elimina una película
app.delete('/peliculas/:id', (req, res) => {
  const id = Number(req.params.id)
  const index = peliculas.findIndex(p => p.id === id)

  if (index === -1) {
    return res.status(404).json({ error: 'Película no encontrada' })
  }

  const eliminada = peliculas.splice(index, 1)[0]

  res.json({ mensaje: 'Película eliminada', pelicula: eliminada })
})
```

**Prueba**:
- `DELETE /peliculas/1` → elimina Inception, devuelve la película eliminada
- `GET /peliculas` → ya no aparece Inception
- `DELETE /peliculas/1` otra vez → 404

### Paso 10: Ruta para rutas inexistentes

Añade esto **justo antes** de `app.listen`:

```javascript
// Esta ruta atrapa cualquier petición que no coincida con las anteriores
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.url} no encontrada` })
})
```

**Prueba**: `GET /peliculas/inexistente-ruta-123` o `GET /hola` → mensaje de error claro.

## Resultado final esperado

Tu `index.js` completo debe tener estas rutas funcionando:

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/peliculas` | Lista todas (con filtro `?genero=`) |
| GET | `/peliculas/:id` | Una película por ID |
| GET | `/estadisticas` | Nota media |
| POST | `/peliculas` | Crea una película |
| DELETE | `/peliculas/:id` | Elimina una película |

## Criterios de evaluación

- [ ] El servidor arranca sin errores con `npm run dev`
- [ ] `GET /peliculas` devuelve todas las películas en JSON
- [ ] `GET /peliculas/1` devuelve la película correcta
- [ ] `GET /peliculas/99` devuelve status 404
- [ ] `GET /peliculas?genero=ciencia-ficcion` filtra correctamente
- [ ] `POST /peliculas` con body completo devuelve status 201 con la nueva película
- [ ] `POST /peliculas` sin campos obligatorios devuelve status 400
- [ ] `GET /estadisticas` calcula la media correctamente
- [ ] `DELETE /peliculas/:id` elimina la película y devuelve status 200
- [ ] Rutas inexistentes devuelven status 404 con mensaje descriptivo

## Bonus

Si terminas antes de tiempo:

1. **Ruta PUT**: Implementa `PUT /peliculas/:id` que actualice todos los campos de una película
2. **Ruta PATCH**: Implementa `PATCH /peliculas/:id` que actualice solo los campos enviados en el body (pista: usa el spread operator `{ ...pelicula, ...req.body }`)
3. **Búsqueda por texto**: Añade `GET /peliculas?buscar=nolan` que filtre películas cuyo director o título contenga el término buscado (case-insensitive)