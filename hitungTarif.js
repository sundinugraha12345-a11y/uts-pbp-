// Tarif per jam untuk tiap jenis kendaraan
export const TARIF_PER_JAM = {
  Motor: 2000,
  Mobil: 5000
};

export const JENIS_VALID = Object.keys(TARIF_PER_JAM);

export function normalisasiJenis(jenis) {
  if (typeof jenis !== 'string') return null;

  for (let i = 0; i < JENIS_VALID.length; i++) {
    if (JENIS_VALID[i].toLowerCase() === jenis.trim().toLowerCase()) {
      return JENIS_VALID[i];
    }
  }
  return null;
}

// Jam harus bilangan bulat 0 - 23
export function jamValid(jam) {
  const angka = Number(jam);
  return jam !== null && jam !== undefined && jam !== '' &&
    Number.isInteger(angka) && angka >= 0 && angka <= 23;
}

// Durasi = jam keluar - jam masuk, minimal dihitung 1 jam
export function hitungDurasi(jamMasuk, jamKeluar) {
  const selisih = jamKeluar - jamMasuk;
  return selisih === 0 ? 1 : selisih;
}

// Total biaya = durasi x tarif per jam
export function hitungBiaya(jenisKendaraan, durasi) {
  const tarif = TARIF_PER_JAM[jenisKendaraan] || 0;
  return durasi * tarif;
}
