# AR Hand 3D Web App

Web app AR 3D berbasis webcam menggunakan Vite, React, TypeScript, Three.js, React Three Fiber, Drei, dan MediaPipe Tasks Vision Hand Landmarker.

## Cara menjalankan

```bash
npm install
npm run dev
```

Buka alamat yang muncul dari Vite, biasanya:

```bash
http://localhost:5173
```

Klik **Start Camera**, izinkan akses kamera, lalu coba gesture:

- **Pinch/cubit**: memunculkan cube dan objek 3D.
- **Pinch dibuka**: memperbesar cube dan objek.
- **Open palm**: menghancurkan objek menjadi partikel.
- **Fist/mengepal**: setelah objek hancur, ganti ke objek berikutnya.

## Ganti placeholder ke model GLB

Letakkan file model di:

```bash
public/models/
```

Contoh:

```bash
public/models/butterfly.glb
public/models/flower.glb
public/models/bird.glb
public/models/fish.glb
public/models/energy_orb.glb
```

Lalu ubah konfigurasi di `src/config/models.ts` dari:

```ts
type: 'placeholder'
```

menjadi:

```ts
type: 'gltf',
path: '/models/butterfly.glb'
```

## Privasi kamera

Aplikasi ini berjalan lokal di browser. Stream webcam digunakan langsung oleh browser dan MediaPipe client-side, tidak dikirim ke server aplikasi karena project ini tidak memiliki backend.
