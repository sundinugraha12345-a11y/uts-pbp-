import express from 'express';
import dataParkir from '../data/parkirData.js';

const router = express.Router();

// 1. ROUTE MENAMPILKAN SEMUA DATA (GET)
router.get('/', (req, res) => {
  res.status(200).json({
    pesan: "Berhasil mengambil semua data parkir",
    totalData: dataParkir.length,
    data: dataParkir
  });
});

// 2. ROUTE MENCARI DATA (GET dengan Query & Perulangan)
router.get('/cari', (req, res) => {
  const { plat, jenis } = req.query;
  let hasilPencarian = [];

  // Syarat 5: Menggunakan perulangan (for loop) dan percabangan
  for (let i = 0; i < dataParkir.length; i++) {
    const item = dataParkir[i];
    if (plat && item.platNomor.toLowerCase().includes(plat.toLowerCase())) {
      hasilPencarian.push(item);
    } else if (jenis && item.jenisKendaraan.toLowerCase() === jenis.toLowerCase()) {
      hasilPencarian.push(item);
    }
  }

  if (hasilPencarian.length === 0) {
    return res.status(404).json({ pesan: "Data kendaraan tidak ditemukan" });
  }

  res.status(200).json({
    pesan: "Hasil pencarian ditemukan",
    data: hasilPencarian
  });
});

// 3. ROUTE MENAMBAHKAN KENDARAAN MASUK (POST)
router.post('/masuk', (req, res) => {
  const { platNomor, jenisKendaraan, jamMasuk } = req.body;

  // Validasi input
  if (!platNomor || !jenisKendaraan || jamMasuk === undefined) {
    return res.status(400).json({ pesan: "Plat nomor, jenis kendaraan, dan jam masuk wajib diisi!" });
  }

  // Cek apakah kendaraan dengan plat sama masih berstatus 'Parkir'
  const sudahAda = dataParkir.find(
    (k) => k.platNomor.toLowerCase() === platNomor.toLowerCase() && k.status === "Parkir"
  );

  if (sudahAda) {
    return res.status(400).json({ pesan: "Kendaraan dengan plat tersebut masih berada di dalam area parkir!" });
  }

  const kendaraanBaru = {
    id: dataParkir.length > 0 ? dataParkir[dataParkir.length - 1].id + 1 : 1,
    platNomor: platNomor.toUpperCase(),
    jenisKendaraan,
    jamMasuk: Number(jamMasuk),
    jamKeluar: null,
    durasi: 0,
    totalBiaya: 0,
    status: "Parkir"
  };

  dataParkir.push(kendaraanBaru);

  res.status(201).json({
    pesan: "Kendaraan berhasil masuk parkir",
    data: kendaraanBaru
  });
});

// 4. ROUTE MENGUBAH DATA / PROSES KELUAR & HITUNG TARIF (PUT)
router.put('/keluar/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { jamKeluar } = req.body;

  const index = dataParkir.findIndex((k) => k.id === id);

  if (index === -1) {
    return res.status(404).json({ pesan: "ID parkir tidak ditemukan" });
  }

  const kendaraan = dataParkir[index];

  if (jamKeluar < kendaraan.jamMasuk) {
    return res.status(400).json({ pesan: "Jam keluar tidak boleh lebih kecil dari jam masuk!" });
  }

  // Syarat 5: Operator aritmatika & percabangan tarif
  const durasi = Number(jamKeluar) - kendaraan.jamMasuk;
  const durasiFinal = durasi === 0 ? 1 : durasi; // Minimal bayar 1 jam
  let tarifPerJam = 0;

  if (kendaraan.jenisKendaraan.toLowerCase() === "motor") {
    tarifPerJam = 2000;
  } else if (kendaraan.jenisKendaraan.toLowerCase() === "mobil") {
    tarifPerJam = 5000;
  } else {
    tarifPerJam = 3000; // Kendaraan lainnya
  }

  const totalBiaya = durasiFinal * tarifPerJam;

  // Update object di dalam array
  dataParkir[index] = {
    ...kendaraan,
    jamKeluar: Number(jamKeluar),
    durasi: durasiFinal,
    totalBiaya,
    status: "Selesai"
  };

  res.status(200).json({
    pesan: "Kendaraan keluar, pembayaran berhasil dihitung",
    struk: dataParkir[index]
  });
});

// 5. ROUTE MENGHAPUS DATA (DELETE)
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = dataParkir.findIndex((k) => k.id === id);

  if (index === -1) {
    return res.status(404).json({ pesan: "Data tidak ditemukan, gagal menghapus" });
  }

  const dataTerhapus = dataParkir.splice(index, 1);

  res.status(200).json({
    pesan: "Data parkir berhasil dihapus",
    dataDihapus: dataTerhapus[0]
  });
});

export default router;