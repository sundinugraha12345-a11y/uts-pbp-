import express from 'express';
import parkirRoutes from './routes/parkirRoutes.js';

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/api/parkir', parkirRoutes);

app.get('/', (req, res) => {
  res.send('Server API Sistem Parkir Berjalan!');
});

// Middleware 404 untuk route yang tidak terdaftar
app.use((req, res) => {
  res.status(404).json({ pesan: "Route tidak ditemukan" });
});

// Middleware error (misalnya JSON dari Postman tidak valid)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ pesan: "Format JSON pada body tidak valid" });
  }
  res.status(500).json({ pesan: "Terjadi kesalahan pada server" });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

console.log("Project: Sistem Parkir");
console.log("By: Kelompok 3");
