const express = require('express'); // framework web
const app = express(); // instancia aplicacion
const path = require('path'); // utilidades de ruta

app.use(express.json()); // analiza JSON de peticiones

// Usamos path.join para evitar errores de rutas en Windows/Linux
app.use(express.static(path.join(__dirname, 'proyectos', 'public'))); // sirve archivos estáticos

let estado = { pendientes: "", realizadas: "" }; // estado guardado en memoria
let nombres = [];  // lista para prevenir duplicados

// Función para sincronizar el array de nombres con el HTML guardado
function sincronizarNombres() { // actualiza lista de nombres
    nombres = []; // reinicia array
    const regex = /<span>(.*?)<\/span>/g; // regex para extraer spans
    let match; // variable auxiliar
    
    // Extraer nombres de pendientes
    while ((match = regex.exec(estado.pendientes)) !== null) { // itera coincidencias
        nombres.push(match[1].toLowerCase()); // agrega en minúsculas
    }
    
    // Extraer nombres de realizadas
    regex.lastIndex = 0; // reinicia busqueda
    while ((match = regex.exec(estado.realizadas)) !== null) { // itera completadas
        nombres.push(match[1].toLowerCase()); // agrega completado
    }
}

// Ruta para servir el index.html explícitamente
app.get('/', (req, res) => { // GET raiz
    res.sendFile(path.join(__dirname, 'proyectos', 'public', 'index.html')); // envía la página principal
});

app.get('/api/estado', (req, res) => res.json(estado)); // GET estado actual

app.post('/api/agregar', (req, res) => { // POST agregar tarea // POST agregar tarea
    const { nombre } = req.body; // recibe nombre de tarea
    if (!nombre || nombres.includes(nombre.toLowerCase())) return res.status(400).send(); // valida
    
    nombres.push(nombre.toLowerCase()); // añade para evitar duplicados
    res.status(201).send(); // responde creado
});

app.post('/api/guardar', (req, res) => { // POST guardar estado
    estado = req.body; // actualiza estado global
    sincronizarNombres(); // regenera lista
    res.sendStatus(200); // confirmación
});

app.listen(8080, '0.0.0.0', () => { // inicia servidor puerto 8080
    console.log('Servidor corriendo en http://0.0.0.0:8080'); // mensaje inicio
});