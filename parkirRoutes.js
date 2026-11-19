import express from 'express';
import {
  getSemuaParkir,
  getParkirById,
  cariParkir,
  getLaporan,
  kendaraanMasuk,
  ubahParkir,
  kendaraanKeluar,
  hapusParkir
} from '../controllers/parkirController.js';

const router = express.Router();

router.get('/', getSemuaParkir);              // tampilkan semua
router.get('/cari', cariParkir);              // cari
router.get('/laporan', getLaporan);           // laporan
router.get('/:id', getParkirById);            // tampilkan berdasarkan id
router.post('/masuk', kendaraanMasuk);        // tambah
router.put('/:id', ubahParkir);               // ubah (koreksi data)
router.patch('/:id/keluar', kendaraanKeluar); // kendaraan keluar + hitung biaya
router.delete('/:id', hapusParkir);           // hapus

export default router;