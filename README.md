# カタカナ MemoTest – Nishi Nihongo Gakko

Un juego de memoria premium para aprender los 46 katakana básicos japoneses. Diseñado para estudiantes hispanohablantes con sonidos tradicionales japoneses, interfaz bilingüe japonés/español y animaciones de alta calidad.

## Cómo Jugar

1. Abre `index.html` en tu navegador
2. Elige tu nivel de dificultad:
   - **かんたん / Fácil** — 20 pares (40 tarjetas)
   - **ふつう / Intermedio** — 30 pares (60 tarjetas)
   - **むずかしい / Experto** — 46 pares (92 tarjetas)
3. Voltea las cartas y encuentra todas las parejas de katakana
4. Mejora tu tiempo y aprende japonés al mismo tiempo

## Características

- **Interfaz bilingüe** japonés/español para aprendizaje natural
- **3 pantallas**: menú con sakura, juego y victoria con confetti
- **Sonidos japoneses auténticos** sintetizados con Web Audio API:
  - Furin (風鈴) — campanitas de viento al navegar
  - Koto (琴) — punteo al voltear tarjetas
  - Rin (鈴) — campana de templo al hacer match
  - Hyoshigi (拍子木) — clappers de madera al fallar
  - Matsuri (祭り) — fanfarria de festival al ganar
- **Animaciones premium**:
  - Flip 3D con easing spring
  - Pétalos de sakura cayendo en el menú
  - Confetti de pétalos en la victoria
  - Hover glow y scale
- **Diseño ultra-responsive**: 4-8 columnas según pantalla
- **Logo Nishi** como reverso de cada tarjeta
- **Katakana grandes** con romaji visible para aprendizaje
- **Récords guardados** por dificultad en localStorage

## Desplegar en Vercel (Gratis)

1. Sube este repo a GitHub
2. Ve a [vercel.com](https://vercel.com) → **New Project** → importa el repo
3. Framework Preset: **Other** → Deploy

Sin dependencias, sin npm, sin build. 100% estático.

## Estructura

```
/
├── index.html         # Markup completo (3 pantallas)
├── styles.css         # Estilos premium (washi/sakura/fuji palette)
├── script.js          # Lógica, audio engine, confetti
├── assets/
│   └── logo/
│       └── logo nishi nihongo gakko.png
└── README.md
```

## Paleta de Colores

Inspirada en el logo de Nishi + estética japonesa tradicional:

| Color | Hex | Uso |
|-------|-----|-----|
| Nishi Teal | `#2a9d8f` | Acentos, header, botones |
| Nishi Dark | `#1a5c5a` | Texto fuerte, gradientes |
| Nishi Rust | `#c0451e` | Acento cálido, victoria |
| Sakura | `#f0a0b8` | Pétalos, hover, selección |
| Washi | `#f5efe3` | Fondo principal |
| Bamboo | `#9b8b6e` | Texto secundario |
| Kinka (Gold) | `#c9a96e` | Focus, detalles |

## Sonidos

Todos generados en tiempo real con Web Audio API (0 archivos de audio):

| Acción | Sonido | Técnica |
|--------|--------|---------|
| Navegar | Furin (風鈴) | Armónicos altos con reverb |
| Voltear | Koto (琴) | Triangle wave con pluck envelope |
| Match | Rin (鈴) | Parciales inarmónicos + vibrato |
| Error | Hyoshigi (拍子木) | Square wave con filtro bandpass |
| Victoria | Matsuri (祭り) | Escala miyako-bushi + taiko |

---

*© Nishi Nihongo Gakko — Aprende japonés con estilo*
