import dataParkir, { KAPASITAS_PARKIR } from '../data/parkirData.js';
import {
  JENIS_VALID,
  normalisasiJenis,
  jamValid,
  hitungDurasi,
  hitungBiaya
} from '../utils/hitungTarif.js';

// Menghitung kendaraan yang sedang parkir (perulangan)
function hitungSedangParkir() {
  let jumlah = 0;
  for (let i = 0; i < dataParkir.length; i++) {
    if (dataParkir[i].status === "Parkir") {
      jumlah++;
    }
  }
  return jumlah;
}

// 1. MENAMPILKAN SEMUA DATA
export const getSemuaParkir = (req, res) => {
  res.status(200).json({
    pesan: "Berhasil mengambil semua data parkir",
    totalData: dataParkir.length,
    data: dataParkir
  });
};

// 2. MENAMPILKAN DATA BERDASARKAN ID
export const getParkirById = (req, res) => {
  const id = parseInt(req.params.id);
  const kendaraan = dataParkir.find((k) => k.id === id);

  if (!kendaraan) {
    return res.status(404).json({ pesan: "ID parkir tidak ditemukan" });
  }

  res.status(200).json({ pesan: "Data ditemukan", data: kendaraan });
};

// 3. MENCARI DATA (query: plat, jenis, status; boleh digabung = AND)
export const cariParkir = (req, res) => {
  const { plat, jenis, status } = req.query;

  if (!plat && !jenis && !status) {
    return res.status(400).json({
      pesan: "Isi minimal satu query: plat, jenis, atau status"
    });
  }

  const hasilPencarian = [];

  for (let i = 0; i < dataParkir.length; i++) {
    const item = dataParkir[i];
    let cocok = true;

    if (plat && !item.platNomor.toLowerCase().includes(plat.toLowerCase())) {
      cocok = false;
    }
    if (jenis && item.jenisKendaraan.toLowerCase() !== jenis.toLowerCase()) {
      cocok = false;
    }
    if (status && item.status.toLowerCase() !== status.toLowerCase()) {
      cocok = false;
    }

    if (cocok) {
      hasilPencarian.push(item);
    }
  }

  if (hasilPencarian.length === 0) {
    return res.status(404).json({ pesan: "Data kendaraan tidak ditemukan" });
  }

  res.status(200).json({
    pesan: "Hasil pencarian ditemukan",
    totalData: hasilPencarian.length,
    data: hasilPencarian
  });
};

// 4. LAPORAN: pendapatan, jumlah per jenis, sisa kapasitas
export const getLaporan = (req, res) => {
  let totalPendapatan = 0;
  let sedangParkir = 0;
  let selesai = 0;
  const perJenis = {};

  for (let i = 0; i < JENIS_VALID.length; i++) {
    perJenis[JENIS_VALID[i]] = 0;
  }

  for (let i = 0; i < dataParkir.length; i++) {
    const item = dataParkir[i];
    perJenis[item.jenisKendaraan] += 1;

    if (item.status === "Selesai") {
      selesai++;
      totalPendapatan += item.totalBiaya;
    } else {
      sedangParkir++;
    }
  }

  res.status(200).json({
    pesan: "Laporan parkir",
    laporan: {
      totalKendaraanTercatat: dataParkir.length,
      sedangParkir,
      sudahKeluar: selesai,
      kapasitas: KAPASITAS_PARKIR,
      sisaKapasitas: KAPASITAS_PARKIR - sedangParkir,
      jumlahPerJenis: perJenis,
      totalPendapatan
    }
  });
};

// 5. KENDARAAN MASUK (TAMBAH DATA)
export const kendaraanMasuk = (req, res) => {
  const { platNomor, jenisKendaraan, jamMasuk } = req.body || {};

  if (!platNomor || !jenisKendaraan || jamMasuk === undefined) {
    return res.status(400).json({
      pesan: "Plat nomor, jenis kendaraan, dan jam masuk wajib diisi!"
    });
  }

  if (typeof platNomor !== 'string' || platNomor.trim() === '') {
    return res.status(400).json({ pesan: "Plat nomor tidak valid" });
  }

  const jenis = normalisasiJenis(jenisKendaraan);
  if (!jenis) {
    return res.status(400).json({
      pesan: `Jenis kendaraan harus salah satu dari: ${JENIS_VALID.join(', ')}`
    });
  }

  if (!jamValid(jamMasuk)) {
    return res.status(400).json({ pesan: "Jam masuk harus bilangan bulat 0 - 23" });
  }

  // Cek kapasitas
  if (hitungSedangParkir() >= KAPASITAS_PARKIR) {
    return res.status(400).json({ pesan: "Parkiran penuh, kendaraan tidak dapat masuk!" });
  }

  // Cek plat duplikat yang masih parkir
  const sudahAda = dataParkir.find(
    (k) => k.platNomor.toLowerCase() === platNomor.trim().toLowerCase() && k.status === "Parkir"
  );
  if (sudahAda) {
    return res.status(400).json({
      pesan: "Kendaraan dengan plat tersebut masih berada di dalam area parkir!"
    });
  }

  const kendaraanBaru = {
    id: dataParkir.length > 0 ? dataParkir[dataParkir.length - 1].id + 1 : 1,
    platNomor: platNomor.trim().toUpperCase(),
    jenisKendaraan: jenis,
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
};

// 6. UBAH DATA (koreksi plat, jenis, jam masuk)
export const ubahParkir = (req, res) => {
  const id = parseInt(req.params.id);
  const { platNomor, jenisKendaraan, jamMasuk } = req.body || {};

  const index = dataParkir.findIndex((k) => k.id === id);
  if (index === -1) {
    return res.status(404).json({ pesan: "ID parkir tidak ditemukan" });
  }

  const kendaraan = dataParkir[index];

  if (kendaraan.status === "Selesai") {
    return res.status(400).json({
      pesan: "Data kendaraan yang sudah keluar tidak dapat diubah"
    });
  }

  if (platNomor === undefined && jenisKendaraan === undefined && jamMasuk === undefined) {
    return res.status(400).json({
      pesan: "Kirim minimal satu field: platNomor, jenisKendaraan, atau jamMasuk"
    });
  }

  let platBaru = kendaraan.platNomor;
  let jenisBaru = kendaraan.jenisKendaraan;
  let jamBaru = kendaraan.jamMasuk;

  if (platNomor !== undefined) {
    if (typeof platNomor !== 'string' || platNomor.trim() === '') {
      return res.status(400).json({ pesan: "Plat nomor tidak valid" });
    }
    platBaru = platNomor.trim().toUpperCase();

    const duplikat = dataParkir.find(
      (k) => k.id !== id && k.platNomor === platBaru && k.status === "Parkir"
    );
    if (duplikat) {
      return res.status(400).json({ pesan: "Plat tersebut sudah dipakai kendaraan yang sedang parkir" });
    }
  }

  if (jenisKendaraan !== undefined) {
    const jenis = normalisasiJenis(jenisKendaraan);
    if (!jenis) {
      return res.status(400).json({
        pesan: `Jenis kendaraan harus salah satu dari: ${JENIS_VALID.join(', ')}`
      });
    }
    jenisBaru = jenis;
  }

  if (jamMasuk !== undefined) {
    if (!jamValid(jamMasuk)) {
      return res.status(400).json({ pesan: "Jam masuk harus bilangan bulat 0 - 23" });
    }
    jamBaru = Number(jamMasuk);
  }

  dataParkir[index] = {
    ...kendaraan,
    platNomor: platBaru,
    jenisKendaraan: jenisBaru,
    jamMasuk: jamBaru
  };

  res.status(200).json({
    pesan: "Data parkir berhasil diubah",
    data: dataParkir[index]
  });
};

// 7. KENDARAAN KELUAR + HITUNG TARIF (ubah status)
export const kendaraanKeluar = (req, res) => {
  const id = parseInt(req.params.id);
  const { jamKeluar } = req.body || {};

  const index = dataParkir.findIndex((k) => k.id === id);
  if (index === -1) {
    return res.status(404).json({ pesan: "ID parkir tidak ditemukan" });
  }

  const kendaraan = dataParkir[index];

  if (kendaraan.status === "Selesai") {
    return res.status(400).json({ pesan: "Kendaraan ini sudah keluar sebelumnya" });
  }

  if (!jamValid(jamKeluar)) {
    return res.status(400).json({ pesan: "Jam keluar wajib diisi, berupa bilangan bulat 0 - 23" });
  }

  if (Number(jamKeluar) < kendaraan.jamMasuk) {
    return res.status(400).json({ pesan: "Jam keluar tidak boleh lebih kecil dari jam masuk!" });
  }

  const durasi = hitungDurasi(kendaraan.jamMasuk, Number(jamKeluar));
  const totalBiaya = hitungBiaya(kendaraan.jenisKendaraan, durasi);

  dataParkir[index] = {
    ...kendaraan,
    jamKeluar: Number(jamKeluar),
    durasi,
    totalBiaya,
    status: "Selesai"
  };

  res.status(200).json({
    pesan: "Kendaraan keluar, pembayaran berhasil dihitung",
    struk: dataParkir[index]
  });
};

// 8. HAPUS DATA
export const hapusParkir = (req, res) => {
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
};
