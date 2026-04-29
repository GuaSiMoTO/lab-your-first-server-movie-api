require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT

app.use(express.json());

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
  },
  {
    id: 4,
    titulo: 'DJANGO',
    director: 'Quentin Tarantino',
    anio: 2012,
    genero: 'acción',
    nota: 10
  },
  {
    id: 5,
    titulo: 'K-pax',
    director: 'Iain Softley',
    anio: 2001,
    genero: 'ciencia-ficcion',
    nota: 8.5
  },
  {
    id: 6,
    titulo: 'Terrifier',
    director: 'Damien Leone',
    anio: 2016,
    genero: 'terror',
    nota: 7
  }
]

let nextId = 7;

// GET
// paso 6:
// GET peliculas con filtro de género
app.get('/peliculas', (req, res)=>{
  const { genero } = req.query

  if (genero) {
    const filtradas = peliculas.filter(peli => peli.genero === genero);
    return res.json(filtradas);
  }

    res.json(peliculas);
});

// INICIAR SERVIDOR
app.listen(PORT, ()=>{
    console.log(`Servidor funcionando hermano! en http://localhost:${PORT}`);
});


// paso 5:
// GET peliculas by ID => /peliculas/:id
app.get('/peliculas/:id',(req, res)=>{
  const id = Number(req.params.id);
  const pelicula = peliculas.find(p=>p.id === id);

  if (!pelicula) {
    return res.status(404).json({error: 'Película no estar! prueba again baby'});
  }


  res.status(200).json(pelicula);
});

// Paso 7: POST / peliculas

app.post('/peliculas',(req,res)=>{
  const { titulo, director, anio, genero, nota } = req.body;

  if (!titulo || !director || !anio || !genero){
    return res.status(400).json({
      error: 'Tienes que introducir titulo, director, anio y genero'
    });
  };

  if (nota !== undefined && (nota < 0 || nota > 10)) {
    return res.status(400).json({error: 'La NOTA entre 0 y 10 porfavor!'});
  };

  const nuevaPeli = {
    id: nextId++,
    titulo,
    director,
    anio: Number(anio),
    genero,
    nota: nota !== undefined ? Number (nota) : null
  }

  peliculas.push(nuevaPeli);

  // mensaje de que se creo correcto
  res.status(201).json(nuevaPeli);

});

// Paso 8: GET = nota media

app.get('/media',(req, res)=>{
  // nos aseguramos que coger todas las notas
  const notas = peliculas.filter(p=>p.nota !== null);

  if (notas.length === 0) {
    return res.json({ media: null, total: 0 });
  }

  const suma = notas.reduce((acumulador, p)=> acumulador += p.nota, 0);
  const media = ( suma / notas.length ).toFixed(2);

  res.json({
    media: Number(media),
    total: peliculas.length,
    nota: notas.length
  });
});

// Paso 9: DELETE por import ID

app.delete('/delete/:id', (req, res) =>{
  const id = Number(req.params.id);
  const index = peliculas.findIndex(p => p.id === id)

  if (index === -1) {
    return res.status(404).json({error: "esa peli no está"});
  }

  const eliminada = peliculas.splice(index, 1)[0];

  res.json({ mensaje: 'Pelicula eleiminada', 'pelicula eliminada': eliminada});
});


//BONUS
// PUT /peliculas/:id actualizar todos los campos
app.put('/peliculas/:id', (req, res) => {
    const { id } = req.params;
    const index = peliculas.findIndex(p => p.id === parseInt(id));

    if (index !== -1) {
        // En PUT reemplazamos el objeto completo con lo que viene en el body
        peliculas[index] = { id: parseInt(id), ...req.body };
        res.json({ mensaje: "Película actualizada (PUT)", pelicula: peliculas[index] });
    } else {
        res.status(404).send("No encontrada");
    }
});



// PATCH /peliculas/:id que actualice solo algunos campos {...pelicula, req-body}
app.patch('/paliculas/:id',(req, res)=>{
  const { id } = req.params;
  const indice = peliculas.findIndex(p => p.id === parseInt(id));

  if (indice === -1) {
    // pelicula no encontrada porque no hay indice
    res.status(404).json({mensaje: "Ese indice no encontro Pelicula"});
  }

  //mantenemos lo que había y sobrescribimos con lo nuevo
  peliculas[indice] = {...peliculas[indice], ...req.body};
  res.json(peliculas[indice]);

});


// GET /peliculas?buscar=nolan filtrar por director o título

// GET: Búsqueda por texto (Query Params)
app.get( '/peliculas',(req, res) => {
    const { buscar } = req.query;
    let resultado = peliculas;

    if (buscar) {
        const termino = buscar.toLowerCase();
        resultado = peliculas.filter(p => 
            p.titulo.toLowerCase().includes(termino) || 
            p.director.toLowerCase().includes(termino)
        );
    }
    res.json(resultado);
}
);