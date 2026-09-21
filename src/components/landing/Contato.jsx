import CabecalhoSecao from './CabecalhoSecao.jsx'
import { useFormularioContato } from '../../hooks/useFormularioContato.js'

const CLASSE_CAMPO =
  'rounded-md border bg-surface-2 px-4 py-3 text-[0.95rem] text-ink transition placeholder:text-ink-3 focus:border-accent focus:bg-accent/10 focus:outline-none'

/**
 * Contato - seção "#contato" da Landing.
 *
 * Porta a <section id="contato"> da Sprint 3: dados institucionais de um
 * lado, formulário do outro. Toda a lógica de campos, validação e estado
 * de envio mora no hook useFormularioContato; aqui só existe a parte
 * visual, que lê o que o hook devolve.
 *
 * Estrutura pai -> filho:
 *   Contato (pai)
 *     |-- CabecalhoSecao (filho)
 *     |-- CampoFormulario (filho, um por campo do formulário)
 */
function Contato({ dados }) {
  const { tag, titulo, tituloDestaque, tituloFim, lead, detalhes, redes, formulario } = dados
  const { campos, erros, enviando, enviado, aoMudar, aoEnviar } = useFormularioContato()

  return (
    <section
      id="contato"
      aria-labelledby="contato-title"
      className="scroll-mt-[var(--header-h)] bg-bg-soft px-6 py-12 md:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto grid max-w-[1200px] items-start gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div>
          <CabecalhoSecao
            id="contato-title"
            tag={tag}
            titulo={titulo}
            tituloDestaque={tituloDestaque}
            tituloFim={tituloFim}
            lead={lead}
            alinhamento="esquerda"
          />

          <address className="mb-8 grid gap-6 not-italic">
            {detalhes.map(detalhe => (
              <p key={detalhe.id} className="leading-relaxed text-ink-2">
                <strong className="mb-1 block text-[0.85rem] uppercase tracking-[0.05em] text-accent">
                  {detalhe.rotulo}
                </strong>
                {detalhe.href ? (
                  <a href={detalhe.href} className="text-ink transition hover:text-accent">
                    {detalhe.texto}
                  </a>
                ) : (
                  detalhe.texto
                )}
              </p>
            ))}
          </address>

          <ul aria-label="Redes sociais" className="flex flex-wrap gap-4">
            {redes.map(rede => (
              <li key={rede.id}>
                <a
                  href={rede.href}
                  className="block rounded-full border border-line-2 bg-surface-2 px-4 py-2 text-[0.85rem] font-semibold text-ink transition hover:border-accent hover:bg-accent hover:text-bg"
                >
                  {rede.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={aoEnviar}
          noValidate
          aria-labelledby="form-title"
          className="grid gap-6 rounded-xl border border-line bg-surface p-6 md:p-12"
        >
          <h3 id="form-title" className="font-display text-[1.4rem] font-bold text-ink">
            {formulario.titulo}
          </h3>

          <CampoFormulario id="nome" rotulo="Nome completo" erro={erros.nome}>
            <input
              type="text"
              id="nome"
              name="nome"
              value={campos.nome}
              onChange={aoMudar}
              placeholder="Como podemos te chamar?"
              className={`${CLASSE_CAMPO} ${erros.nome ? 'border-danger' : 'border-line-2'}`}
            />
          </CampoFormulario>

          <CampoFormulario id="email" rotulo="Email" erro={erros.email}>
            <input
              type="email"
              id="email"
              name="email"
              value={campos.email}
              onChange={aoMudar}
              placeholder="seu@email.com"
              className={`${CLASSE_CAMPO} ${erros.email ? 'border-danger' : 'border-line-2'}`}
            />
          </CampoFormulario>

          <CampoFormulario id="assunto" rotulo="Assunto" erro={erros.assunto}>
            <select
              id="assunto"
              name="assunto"
              value={campos.assunto}
              onChange={aoMudar}
              className={`${CLASSE_CAMPO} ${erros.assunto ? 'border-danger' : 'border-line-2'}`}
            >
              <option value="">Selecione...</option>
              {formulario.assuntos.map(assunto => (
                <option key={assunto.valor} value={assunto.valor}>
                  {assunto.label}
                </option>
              ))}
            </select>
          </CampoFormulario>

          <CampoFormulario id="mensagem" rotulo="Mensagem" erro={erros.mensagem}>
            <textarea
              id="mensagem"
              name="mensagem"
              rows={5}
              value={campos.mensagem}
              onChange={aoMudar}
              placeholder="Escreva sua mensagem aqui..."
              className={`${CLASSE_CAMPO} min-h-[100px] resize-y ${
                erros.mensagem ? 'border-danger' : 'border-line-2'
              }`}
            />
          </CampoFormulario>

          <button
            type="submit"
            disabled={enviando}
            className={`w-full rounded-full px-8 py-3.5 font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
              enviado ? 'bg-accent-hi text-bg' : 'bg-accent text-bg hover:bg-accent-hi'
            }`}
          >
            {enviando ? 'Enviando...' : enviado ? 'Mensagem enviada!' : 'Enviar mensagem'}
          </button>

          {/* Confirmação acessível: o leitor de tela anuncia sem precisar de foco */}
          <p role="status" aria-live="polite" className="sr-only">
            {enviado ? 'Mensagem enviada com sucesso.' : ''}
          </p>
        </form>
      </div>
    </section>
  )
}

/**
 * CampoFormulario - filho do Contato: rótulo, campo e mensagem de erro.
 * O campo em si chega como children, então serve para input, select e textarea.
 */
function CampoFormulario({ id, rotulo, erro, children }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[0.9rem] font-semibold text-ink-2">
        {rotulo}
      </label>
      {children}
      {erro && (
        <span role="alert" className="text-[0.8rem] text-danger">
          {erro}
        </span>
      )}
    </div>
  )
}

export default Contato
