/**
 * captura-efeitos.js
 * Som de obturador e vibração no momento da captura.
 *
 * Portado de js/camera.js da Sprint 2. O som é sintetizado na hora com a
 * Web Audio API, sem arquivo de áudio: dois cliques curtos que imitam o
 * espelho de uma câmera abrindo e fechando.
 */

/** Toca o clique do obturador. Silencioso se o navegador não suportar. */
export function tocarObturador() {
  try {
    const Contexto = window.AudioContext || window.webkitAudioContext
    if (!Contexto) return

    const ctx = new Contexto()
    const agora = ctx.currentTime

    // Dois estalos curtos: abertura e fechamento
    ;[0, 0.09].forEach((atraso, indice) => {
      const oscilador = ctx.createOscillator()
      const ganho = ctx.createGain()

      oscilador.connect(ganho)
      ganho.connect(ctx.destination)

      oscilador.type = 'square'
      oscilador.frequency.setValueAtTime(indice === 0 ? 1800 : 1200, agora + atraso)

      ganho.gain.setValueAtTime(0.05, agora + atraso)
      ganho.gain.exponentialRampToValueAtTime(0.0001, agora + atraso + 0.05)

      oscilador.start(agora + atraso)
      oscilador.stop(agora + atraso + 0.06)
    })

    // Libera o contexto depois que os dois estalos terminam
    setTimeout(() => ctx.close().catch(() => {}), 400)
  } catch {
    /* áudio indisponível: a captura continua normalmente */
  }
}

/** Vibração curta, onde o dispositivo suportar. */
export function vibrar() {
  try {
    if (navigator.vibrate) navigator.vibrate(35)
  } catch {
    /* ignora */
  }
}
