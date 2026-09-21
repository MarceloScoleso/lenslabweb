import { Link, Navigate } from 'react-router-dom'
import { useLogin } from '../../hooks/useLogin.js'
import { useAuth } from '../../hooks/useAuth.js'

/**
 * Login - Rota pública de acesso ao aplicativo.
 * Toda a lógica vive em useLogin; este componente só desenha a tela.
 *
 * Estrutura pai -> filho:
 *   Login (pai)
 *     |-- CampoTexto (filho, repetido)
 */
function Login() {
  const { autenticado } = useAuth()
  const { email, setEmail, senha, setSenha, erro, enviando, enviar, preencherDemo } = useLogin()

  if (autenticado) return <Navigate to="/painel" replace />

  return (
    <div className="relative flex min-h-[calc(100vh-var(--header-h))] items-center justify-center px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,200,150,0.10),transparent_55%)]"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <img src="/assets/lenslab.webp" alt="LensLab" className="mx-auto mb-6 h-9 w-auto" />
          <h1 className="font-display text-3xl font-bold text-ink">Entre para estudar</h1>
          <p className="mt-2 text-sm text-ink-2">
            Seu material, seus exercícios e sua galeria ficam salvos na sua conta.
          </p>
        </div>

        <form
          onSubmit={enviar}
          noValidate
          className="rounded-xl border border-line bg-surface p-6 shadow-card sm:p-8"
        >
          <CampoTexto
            id="email"
            rotulo="E-mail"
            tipo="email"
            valor={email}
            aoMudar={setEmail}
            autoComplete="email"
            placeholder="voce@exemplo.com"
          />
          <CampoTexto
            id="senha"
            rotulo="Senha"
            tipo="password"
            valor={senha}
            aoMudar={setSenha}
            autoComplete="current-password"
            placeholder="••••••••"
          />

          {erro && (
            <p role="alert" className="mb-4 rounded-sm border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-bg transition hover:bg-accent-hi disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando && <span className="h-4 w-4 animate-spin rounded-full border-2 border-bg/30 border-t-bg" />}
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="mt-6 rounded-md border border-dashed border-line-2 bg-bg-soft p-4 text-sm">
            <p className="font-semibold text-ink">Acesso de teste</p>
            <p className="mt-1 font-mono text-xs text-ink-2">estudante@lenslab.com · lenslab123</p>
            <button
              type="button"
              onClick={preencherDemo}
              className="mt-3 text-sm font-semibold text-accent underline-offset-4 hover:underline"
            >
              Preencher automaticamente
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-ink-3">
          <Link to="/" className="hover:text-ink-2">Voltar para a página inicial</Link>
        </p>
      </div>
    </div>
  )
}

/**
 * CampoTexto - filho: rótulo + input controlado
 */
function CampoTexto({ id, rotulo, tipo, valor, aoMudar, ...resto }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {rotulo}
      </label>
      <input
        id={id}
        type={tipo}
        value={valor}
        onChange={e => aoMudar(e.target.value)}
        className="w-full rounded-md border border-line-2 bg-bg px-4 py-3 text-ink placeholder:text-ink-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
        {...resto}
      />
    </div>
  )
}

export default Login
