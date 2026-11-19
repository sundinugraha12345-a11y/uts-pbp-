import express from 'express';
import parkirRoutes from './routes/parkirRoutes.js';

const app = express();
const PORT = 3000;

// Middleware untuk membaca JSON dari body request (Postman)
app.use(express.json());

// Menggunakan module route
app.use('/api/parkir', parkirRoutes);

// Route default
app.get('/', (req, res) => {
  res.send('Server API Sistem Parkir Berjalan!');
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});