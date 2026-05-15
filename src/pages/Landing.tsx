import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const fadeItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
}

const fadeContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const steps = [
  { title: '1. Convite', text: 'O gestor cria o projeto e convida o cliente por e-mail ou vínculo direto.' },
  { title: '2. Transparência', text: 'O cliente acompanha marcos, entregáveis e o quadro de tarefas em tempo real.' },
  { title: '3. Entrega', text: 'Status e revisões ficam documentados; menos ruído em e-mail e planilhas paralelas.' },
]

const features = [
  { title: 'Quadro Kanban', text: 'Visualize fluxo de trabalho com colunas claras e arrastar-e-soltar (cliente).' },
  { title: 'Papéis separados', text: 'Gestor administra CRUD; cliente vê o que importa para o negócio.' },
  { title: 'Dark mode', text: 'Interface escura consistente, focada em leitura prolongada.' },
]

export default function Landing() {
  return (
    <div className="landing">
      <header className="topbar landing-topbar">
        <span className="brand">ProjetoHub</span>
        <nav className="landing-nav">
          <Link to="/login" className="btn btn-ghost btn-nav">
            Entrar
          </Link>
        </nav>
      </header>

      <section className="landing-hero shell">
        <motion.div
          className="landing-hero-grid"
          initial="hidden"
          animate="show"
          variants={fadeContainer}
        >
          <motion.div variants={fadeItem}>
            <p className="landing-kicker">Gestão de projetos para agências e times de desenvolvimento</p>
            <h1 className="landing-title">Clareza para o time. Confiança para o cliente.</h1>
            <p className="landing-lead">
              Um hub único para tarefas, marcos e entregáveis — com visão administrativa completa e visão simplificada
              para quem acompanha o projeto de fora.
            </p>
            <div className="landing-cta">
              <Link to="/login" className="btn btn-primary btn-cta">
                Acessar plataforma
              </Link>
            </div>
          </motion.div>
          <motion.div variants={fadeItem} className="landing-glow-card" aria-hidden>
            <div className="landing-glow-inner">
              <span className="landing-glow-tag">Live</span>
              <p className="landing-glow-title">Status unificado</p>
              <p className="landing-glow-text">Do kickoff ao go-live, todos enxergam o mesmo quadro.</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="landing-section shell">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
        >
          Como funciona
        </motion.h2>
        <div className="landing-steps">
          {steps.map((s, i) => (
            <motion.article
              key={s.title}
              className="landing-step-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.08 * i, duration: 0.4 }}
            >
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="landing-section shell landing-section--alt">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
        >
          Funcionalidades
        </motion.h2>
        <div className="landing-features">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="landing-feature"
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: 0.06 * i, duration: 0.35 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="landing-footer shell">
        <p>ProjetoHub — trabalho acadêmico FasMicro + React.</p>
        <Link to="/login" className="btn btn-primary btn-cta">
          Começar agora
        </Link>
      </footer>
    </div>
  )
}
