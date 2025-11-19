// Dependencias
require('dotenv').config({ path: './.env' }); // Cargar variables de entorno
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Para permitir peticiones desde tu archivo HTML


const usuarioSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Aseguramos que el email sea único
    telefono: { type: String, required: true },
    fechaN: { type: Date, required: true },
    genero: { type: String, required: true },
    rfc: { type: String, required: true, maxlength: 13, unique: true },
}, {
    timestamps: true // Añade campos createdAt y updatedAt automáticamente
});

// 2. Creación del Modelo basado en el Esquema
const Usuario = mongoose.model('Usuario', usuarioSchema, 'usuarios'); // Nombre de la colección: 'usuarios'

// 3. Conexión a la base de datos
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => console.error('❌ Error de conexión a MongoDB:', err));


// --- CONFIGURACIÓN DEL SERVIDOR EXPRESS ---

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Permite que el frontend (tu HTML) se conecte
app.use(express.json()); // Permite que Express lea el cuerpo de las peticiones en formato JSON


// --- 🚀 RUTAS (CRUD) ---

// 1. CREATE: Crear un nuevo usuario (POST)
app.post('/api/usuarios', async (req, res) => {
    try {
        const nuevoUsuario = new Usuario(req.body);
        const usuarioGuardado = await nuevoUsuario.save();
        res.status(201).json(usuarioGuardado);
    } catch (error) {
        // Manejar errores de validación o duplicidad de email/rfc
        if (error.code === 11000) {
             return res.status(400).json({ message: "El correo o RFC ya están registrados." });
        }
        res.status(500).json({ message: "Error al registrar el usuario", error: error.message });
    }
});

// 2. READ: Obtener todos los usuarios (GET)
app.get('/api/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los usuarios", error: error.message });
    }
});

// 3. READ: Obtener un solo usuario por ID (GET)
app.get('/api/usuarios/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el usuario", error: error.message });
    }
});


// 4. UPDATE: Actualizar un usuario por ID (PUT)
app.put('/api/usuarios/:id', async (req, res) => {
    try {
        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // {new: true} retorna el documento actualizado
        );
        if (!usuarioActualizado) {
            return res.status(404).json({ message: "Usuario no encontrado para actualizar" });
        }
        res.status(200).json(usuarioActualizado);
    } catch (error) {
         if (error.code === 11000) {
             return res.status(400).json({ message: "El correo o RFC ya están registrados en otro usuario." });
        }
        res.status(500).json({ message: "Error al actualizar el usuario", error: error.message });
    }
});

// 5. DELETE: Eliminar un usuario por ID (DELETE)
app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuarioEliminado) {
            return res.status(404).json({ message: "Usuario no encontrado para eliminar" });
        }
        res.status(200).json({ message: "Usuario eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el usuario", error: error.message });
    }
});


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`📡 Servidor Express corriendo en http://localhost:${PORT}`);
});