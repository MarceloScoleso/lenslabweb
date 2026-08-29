/**
 * Icon - Componente FILHO puramente visual
 *
 * Substitui os emojis usados na Sprint 2 por um traçado SVG consistente.
 * Todos os desenhos usam a mesma grade de 24x24 e herdam a cor do texto
 * (currentColor), então basta trocar `color` no CSS para recolorir.
 *
 * Props:
 *   - nome: chave do desenho (ver DESENHOS abaixo)
 *   - tamanho: lado do quadrado em px (padrão 20)
 *   - traco: espessura do traço (padrão 1.7)
 */

const DESENHOS = {
  camera: (
    <>
      <path d="M3.8 8.4h3.1l1.5-2.3a1 1 0 0 1 .8-.5h5.6a1 1 0 0 1 .8.5l1.5 2.3h3.1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3.8a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13.4" r="3.2" />
    </>
  ),
  cameraOff: (
    <>
      <path d="M3.8 8.4h3.1l1.5-2.3a1 1 0 0 1 .8-.5h5.6a1 1 0 0 1 .8.5l1.5 2.3h3.1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3.8a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13.4" r="3.2" />
      <path d="M3.5 3.5 20.5 20.5" />
    </>
  ),
  livro: (
    <>
      <path d="M12 6.6c-1.9-1.5-4.2-2.1-7.2-2.1v12.2c3 0 5.3.6 7.2 2.1 1.9-1.5 4.2-2.1 7.2-2.1V4.5c-3 0-5.3.6-7.2 2.1Z" />
      <path d="M12 6.6v12.2" />
    </>
  ),
  calculadora: (
    <>
      <rect x="4.2" y="3" width="15.6" height="18" rx="2.4" />
      <rect x="7.6" y="6.4" width="8.8" height="3.4" rx="1.1" />
      <circle cx="8.4" cy="13.6" r="0.95" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13.6" r="0.95" fill="currentColor" stroke="none" />
      <circle cx="15.6" cy="13.6" r="0.95" fill="currentColor" stroke="none" />
      <circle cx="8.4" cy="17.4" r="0.95" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17.4" r="0.95" fill="currentColor" stroke="none" />
      <circle cx="15.6" cy="17.4" r="0.95" fill="currentColor" stroke="none" />
    </>
  ),
  pasta: (
    <path d="M3 7.6A2.1 2.1 0 0 1 5.1 5.5h3.5a2 2 0 0 1 1.6.8l.9 1.2h7.8A2.1 2.1 0 0 1 21 9.6v7.3a2.1 2.1 0 0 1-2.1 2.1H5.1A2.1 2.1 0 0 1 3 16.9Z" />
  ),
  imagem: (
    <>
      <rect x="3.2" y="5" width="17.6" height="14" rx="2.2" />
      <circle cx="8.6" cy="10" r="1.6" />
      <path d="m4.2 17.4 4.6-4.6 3.1 3.1 3-3 5 5" />
    </>
  ),
  check: <path d="m4.8 12.6 4.7 4.7L19.2 7" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="m8.2 12.3 2.7 2.7 4.9-5.4" />
    </>
  ),
  x: <path d="M6.2 6.2 17.8 17.8M17.8 6.2 6.2 17.8" />,
  xCircle: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6" />
    </>
  ),
  relogio: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 7.1v5.2l3.2 1.9" />
    </>
  ),
  historico: (
    <>
      <path d="M3.6 12a8.4 8.4 0 1 0 2.6-6.1L3.2 8.8" />
      <path d="M3 4.6v4.4h4.4" />
      <path d="M12 8v4.3l3 1.8" />
    </>
  ),
  lixeira: (
    <>
      <path d="M4.2 6.9h15.6" />
      <path d="M9.6 6.9V5.3a1.3 1.3 0 0 1 1.3-1.3h2.2a1.3 1.3 0 0 1 1.3 1.3v1.6" />
      <path d="m6.4 6.9.9 12a1.9 1.9 0 0 0 1.9 1.8h5.6a1.9 1.9 0 0 0 1.9-1.8l.9-12" />
      <path d="M10.3 10.6v6.4M13.7 10.6v6.4" />
    </>
  ),
  restaurar: (
    <>
      <path d="M4.4 10.2h8.9a5 5 0 1 1 0 10H8.6" />
      <path d="m4.4 10.2 3.7-3.7M4.4 10.2l3.7 3.7" />
    </>
  ),
  mais: <path d="M12 5.2v13.6M5.2 12h13.6" />,
  busca: (
    <>
      <circle cx="10.9" cy="10.9" r="6.4" />
      <path d="m15.6 15.6 4.4 4.4" />
    </>
  ),
  grade: (
    <>
      <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="2.4" />
      <path d="M3.4 9.1h17.2M3.4 14.9h17.2M9.1 3.4v17.2M14.9 3.4v17.2" />
    </>
  ),
  girar: (
    <>
      <path d="M20.2 11.2a8.2 8.2 0 0 0-14-5.4L3.8 8.1" />
      <path d="M3.8 3.9v4.2H8" />
      <path d="M3.8 12.8a8.2 8.2 0 0 0 14 5.4l2.4-2.3" />
      <path d="M20.2 20.1v-4.2H16" />
    </>
  ),
  brilho: (
    <>
      <path d="m12 3.6 1.75 4.65L18.4 10l-4.65 1.75L12 16.4l-1.75-4.65L5.6 10l4.65-1.75Z" />
      <path d="m18.3 15.2.85 2.15 2.15.85-2.15.85-.85 2.15-.85-2.15-2.15-.85 2.15-.85Z" />
    </>
  ),
  dica: (
    <>
      <path d="M12 3.2a6.1 6.1 0 0 0-3.6 11c.55.4.85 1 .85 1.65v.75h5.5v-.75c0-.65.3-1.25.85-1.65A6.1 6.1 0 0 0 12 3.2Z" />
      <path d="M9.8 19.2h4.4M10.6 21.4h2.8" />
    </>
  ),
  olho: (
    <>
      <path d="M2.6 12S6.1 5.8 12 5.8 21.4 12 21.4 12 17.9 18.2 12 18.2 2.6 12 2.6 12Z" />
      <circle cx="12" cy="12" r="3.1" />
    </>
  ),
  processador: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <rect x="9.2" y="9.2" width="5.6" height="5.6" rx="1.4" />
      <path d="M9.4 2.4v2.6M14.6 2.4v2.6M9.4 19v2.6M14.6 19v2.6M2.4 9.4H5M2.4 14.6H5M19 9.4h2.6M19 14.6h2.6" />
    </>
  ),
  documento: (
    <>
      <path d="M6.2 3.4h7.3L19 8.9v11.7a1 1 0 0 1-1 1H6.2a1 1 0 0 1-1-1V4.4a1 1 0 0 1 1-1Z" />
      <path d="M13.5 3.4v5.5H19" />
      <path d="M8.4 13.2h7.2M8.4 16.6h5" />
    </>
  ),
  cartoes: (
    <>
      <path d="m12 3.4 8.4 4.3-8.4 4.3-8.4-4.3Z" />
      <path d="m3.6 12 8.4 4.3 8.4-4.3" />
      <path d="m3.6 16.2 8.4 4.3 8.4-4.3" />
    </>
  ),
  ajuda: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.75.3-1 .9-1 1.6v.35" />
      <circle cx="12" cy="16.7" r="0.95" fill="currentColor" stroke="none" />
    </>
  ),
  alvo: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <circle cx="12" cy="12" r="4.4" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  grafico: <path d="M5.2 19.4v-6.6M12 19.4V5.2M18.8 19.4v-4.2" />,
  setaDireita: <path d="M4.4 12h14.2M13 6.4l5.6 5.6-5.6 5.6" />,
  setaEsquerda: <path d="M19.6 12H5.4M11 6.4 5.4 12l5.6 5.6" />,
  chevronBaixo: <path d="m6.4 9.6 5.6 5.6 5.6-5.6" />,
  chevronCima: <path d="m6.4 14.4 5.6-5.6 5.6 5.6" />,
  salvar: (
    <>
      <path d="M5.2 5.7A1.7 1.7 0 0 1 6.9 4h8.4L20 8.7v9.6A1.7 1.7 0 0 1 18.3 20H6.9a1.7 1.7 0 0 1-1.7-1.7Z" />
      <path d="M8.6 4v4.6h6.6V4" />
      <path d="M8.2 20v-6.2h7.6V20" />
    </>
  ),
  enviar: (
    <>
      <path d="M12 15.8V4.2" />
      <path d="M7.7 8.5 12 4.2l4.3 4.3" />
      <path d="M4.6 15v3.4A1.6 1.6 0 0 0 6.2 20h11.6a1.6 1.6 0 0 0 1.6-1.6V15" />
    </>
  ),
  caixaVazia: (
    <>
      <path d="M3.4 13.6h4.2l1.3 2.3h6.2l1.3-2.3h4.2" />
      <path d="M3.4 13.6 6.3 6a1.6 1.6 0 0 1 1.5-1h8.4a1.6 1.6 0 0 1 1.5 1l2.9 7.6v4.9a1.6 1.6 0 0 1-1.6 1.6H5a1.6 1.6 0 0 1-1.6-1.6Z" />
    </>
  ),
  medalha: (
    <>
      <circle cx="12" cy="9.2" r="5.2" />
      <path d="m8.6 13.4-1.2 7.4 4.6-2.5 4.6 2.5-1.2-7.4" />
    </>
  ),
  raio: <path d="M12.6 3 5.4 13.4h5.4l-.8 7.6 7.6-10.8h-5.4Z" />,
  usuarios: (
    <>
      <circle cx="9.6" cy="8.4" r="3.6" />
      <path d="M3.6 20a6 6 0 0 1 12 0" />
      <path d="M16.2 5.2a3.6 3.6 0 0 1 0 6.6M17.2 14.6a6 6 0 0 1 3.2 5.4" />
    </>
  ),
  camadas: (
    <>
      <rect x="3.4" y="4.4" width="17.2" height="15.2" rx="2.4" />
      <path d="M3.4 9.6h17.2M9.4 9.6v10" />
    </>
  ),

  /* ===== Modos de câmera (portados da Sprint 2) ===== */
  pessoa: (
    <>
      <circle cx="12" cy="8.2" r="3.9" />
      <path d="M4.8 20.4a7.2 7.2 0 0 1 14.4 0" />
    </>
  ),
  selfie: (
    <>
      <circle cx="12" cy="9.4" r="3.4" />
      <path d="M6.4 20.4a5.6 5.6 0 0 1 11.2 0" />
      <path d="M3.2 7.4V5a1.8 1.8 0 0 1 1.8-1.8h2.2M20.8 7.4V5A1.8 1.8 0 0 0 19 3.2h-2.2" />
    </>
  ),
  lua: <path d="M20.4 14.6A8.8 8.8 0 0 1 9.4 3.6a8.8 8.8 0 1 0 11 11Z" />,
  caderno: (
    <>
      <path d="M7 3.6h11.4a1 1 0 0 1 1 1v14.8a1 1 0 0 1-1 1H7" />
      <path d="M7 3.6a2.4 2.4 0 0 0 0 4.8h2.4M7 3.6v16.8" />
      <path d="M4.6 8.4H7M12 8.6h4.4M12 12.4h4.4M12 16.2h3" />
    </>
  ),
  lousa: (
    <>
      <rect x="2.8" y="4" width="18.4" height="12.6" rx="1.8" />
      <path d="M12 16.6v4M8.6 20.6h6.8" />
      <path d="M6.6 8.4h6M6.6 12h4" />
    </>
  ),
  qrcode: (
    <>
      <rect x="3.4" y="3.4" width="6.4" height="6.4" rx="1.4" />
      <rect x="14.2" y="3.4" width="6.4" height="6.4" rx="1.4" />
      <rect x="3.4" y="14.2" width="6.4" height="6.4" rx="1.4" />
      <path d="M14.2 14.2h3v3h-3zM20.6 14.2v3M17.6 20.6h3M14.2 20.6h.4" />
    </>
  ),
  flor: (
    <>
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 9.4c0-2.6-1.2-4.2-2.9-4.2S6.4 6.6 7.6 8.8 10.6 12 12 12" />
      <path d="M14.6 12c2.6 0 4.2-1.2 4.2-2.9s-1.4-2.7-3.6-1.5S12 10.6 12 12" />
      <path d="M12 14.6c0 2.6 1.2 4.2 2.9 4.2s2.7-1.4 1.5-3.6S13.4 12 12 12" />
      <path d="M9.4 12c-2.6 0-4.2 1.2-4.2 2.9s1.4 2.7 3.6 1.5S12 13.4 12 12" />
    </>
  ),
  panorama: (
    <>
      <path d="M2.6 6.4c6.3 1.5 12.5 1.5 18.8 0v11.2c-6.3-1.5-12.5-1.5-18.8 0Z" />
      <path d="m6.4 14.4 3.2-3.4 2.6 2.6 2.4-2 3 3" />
    </>
  ),
  comida: (
    <>
      <path d="M3.6 11.4h16.8a8.4 8.4 0 0 1-16.8 0Z" />
      <path d="M2.6 19.8h18.8" />
      <path d="M8 8.2c0-1.4 1.2-1.8 1.2-3.2M12 8.2c0-1.4 1.2-1.8 1.2-3.2M16 8.2c0-1.4 1.2-1.8 1.2-3.2" />
    </>
  ),
  slowmo: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="m10.2 8.8 5.4 3.2-5.4 3.2Z" />
      <path d="M4.6 12H2.2M21.8 12h-2.4" />
    </>
  ),
  ampulheta: (
    <>
      <path d="M6.6 3.4h10.8M6.6 20.6h10.8" />
      <path d="M7.6 3.4v3.2c0 2 1.6 3.6 3.2 4.4l1.2.6-1.2.6c-1.6.8-3.2 2.4-3.2 4.4v3.6" />
      <path d="M16.4 3.4v3.2c0 2-1.6 3.6-3.2 4.4l-1.2.6 1.2.6c1.6.8 3.2 2.4 3.2 4.4v3.6" />
    </>
  ),

  /* ===== Controles da câmera ===== */
  flashOff: (
    <>
      <path d="M13.2 2.6 4.4 13.4h7.2l-.8 8 8.8-10.8h-7.2Z" />
      <path d="M3.4 3.4 20.6 20.6" />
    </>
  ),
  ajustes: (
    <>
      <path d="M4.4 7.4h15.2M4.4 12h15.2M4.4 16.6h15.2" />
      <circle cx="9" cy="7.4" r="2.1" fill="var(--surface, #101614)" />
      <circle cx="15.4" cy="12" r="2.1" fill="var(--surface, #101614)" />
      <circle cx="7.6" cy="16.6" r="2.1" fill="var(--surface, #101614)" />
    </>
  ),
  proporcao: (
    <>
      <rect x="2.8" y="5.6" width="18.4" height="12.8" rx="1.8" />
      <rect x="7.4" y="8.6" width="9.2" height="6.8" rx="1.2" strokeDasharray="3 2.5" />
    </>
  ),
  som: (
    <>
      <path d="M4.4 9.4h3.2l4.4-3.6v12.4l-4.4-3.6H4.4Z" />
      <path d="M15.6 9.2a4 4 0 0 1 0 5.6M18.2 6.6a7.6 7.6 0 0 1 0 10.8" />
    </>
  ),
  somOff: (
    <>
      <path d="M4.4 9.4h3.2l4.4-3.6v12.4l-4.4-3.6H4.4Z" />
      <path d="m16 9.8 4.4 4.4M20.4 9.8 16 14.2" />
    </>
  ),
  alerta: (
    <>
      <path d="M12 3.6 2.6 20h18.8L12 3.6Z" />
      <path d="M12 9.8v4.4" />
      <circle cx="12" cy="17.2" r="0.95" fill="currentColor" stroke="none" />
    </>
  )
}

function Icon({ nome, tamanho = 20, traco = 1.7, className }) {
  const desenho = DESENHOS[nome]
  if (!desenho) return null

  return (
    <svg
      className={className}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={traco}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {desenho}
    </svg>
  )
}

export default Icon
