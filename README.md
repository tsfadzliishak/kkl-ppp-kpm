# Kerangka Kurikulum Latihan (KKL) PPP KPM

Laman web interaktif bagi Kerangka Kurikulum Latihan Pegawai Perkhidmatan Pendidikan, Kementerian Pendidikan.

`index.html` ialah laman siap bina yang lengkap dalam satu fail. Buka terus dalam pelayar, atau hoskan di mana-mana pelayan statik (contohnya GitHub Pages: Settings > Pages > Deploy from a branch > `main` / root).

## Laman

| Laman | Kandungan |
| --- | --- |
| Utama | Tajuk, Visi dan Misi, lima prinsip kurikulum latihan, pautan ke semua laman |
| Mengenai | Pengenalan, Tujuan, Matlamat dan Objektif, Kesimpulan |
| Kerangka | Rajah separa bulatan interaktif dan lima lapisan struktur |
| Domain | 3 domain dan 8 elemen pembelajaran |
| Kluster | 4 kluster latihan dan 30 bidang fokus, dengan tapisan dan carian |
| Kaedah | 20 kaedah penyampaian dan 14 kaedah pentaksiran |
| Perancang | Simulasi Perancang Latihan; kad ringkasan modul dijana sebagai PDF |
| Kuiz | 20 soalan; 15 jawapan betul melayakkan peserta memuat turun eSijil PDF |
| Soalan Lazim | 11 soalan lazim, glosari dan singkatan |
| Lampiran | Rujukan, Penghargaan dan Sekalung Budi |

## Struktur kod

| Fail | Fungsi |
| --- | --- |
| `src/data.js` | Semua kandungan teks (domain, kluster, kaedah, soalan kuiz, glosari dan lain-lain) |
| `src/app.jsx` | Komponen React, navigasi laman, penjana eSijil dan kad PDF |
| `src/styles.css` | Token tema dan gaya Tailwind CSS |
| `build.js` | Menggabungkan semuanya menjadi `index.html` |

## Bina semula

Perlukan Node.js 18 atau lebih baharu.

```
npm install
npm run build
```

Untuk mengubah kandungan, sunting `src/data.js` dan bina semula.

## Nota

- Markah lulus eSijil ditetapkan oleh pemalar `LULUS` dalam `src/app.jsx` (kini 15 daripada 20).
- eSijil dan kad modul dijana dalam pelayar peserta. Nama pada eSijil ditaip sendiri oleh peserta; tiada rekod disimpan dan tiada pengesahan dibuat.
- eSijil tidak mengandungi jata, tandatangan atau nombor siri.
- Fon dimuat dari Google Fonts; tanpa sambungan Internet, laman menggunakan fon sistem.
