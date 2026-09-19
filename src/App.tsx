import { useState } from 'react'
import { ArrowUpRight, Bell, BookOpen, Check, ChevronRight, CircleHelp, Compass, Flame, LayoutDashboard, Menu, Plus, Settings, Sparkles, Target, X } from 'lucide-react'

const habits = [
  { name: 'Leitura estratégica', detail: '20 min por dia', color: 'bg-[#e9c46a]', done: true },
  { name: 'Movimento consciente', detail: '30 min por dia', color: 'bg-[#a8c686]', done: true },
  { name: 'Registrar aprendizados', detail: '5 min por dia', color: 'bg-[#b8d9d0]', done: false },
]

const milestones = [
  { title: 'Definir meu norte', subtitle: 'Clareza de propósito', status: 'Concluído', done: true },
  { title: 'Construir consistência', subtitle: 'Hábitos que sustentam', status: 'Em andamento', done: false },
  { title: 'Expandir horizontes', subtitle: 'Novos desafios', status: 'Próximo', done: false },
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [checkedHabits, setCheckedHabits] = useState(habits.map((habit) => habit.done))
  const completeCount = checkedHabits.filter(Boolean).length

  return (
    <main className="min-h-screen bg-cream selection:bg-[#c9dfaa]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <a href="#inicio" className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="grid size-10 place-items-center rounded-2xl bg-forest text-lg text-white">↗</span>
          <span>Trilha <em className="font-display font-semibold not-italic">de Crescimento</em></span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-[#527067] md:flex">
          <a className="text-ink" href="#inicio">Início</a><a href="#trilha">Minha trilha</a><a href="#recursos">Recursos</a>
        </nav>
        <div className="hidden items-center gap-3 md:flex"><button aria-label="Notificações" className="grid size-10 place-items-center rounded-full border border-[#dedbce] bg-white"><Bell size={17}/></button><button className="size-10 rounded-full bg-[#ddaa7c] text-sm font-bold">MS</button></div>
        <button className="rounded-xl p-2 md:hidden" aria-label="Abrir menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      {menuOpen && <nav className="mx-5 mb-3 flex flex-col rounded-2xl bg-white p-4 text-sm shadow-sm md:hidden"><a className="py-2" href="#inicio">Início</a><a className="py-2" href="#trilha">Minha trilha</a><a className="py-2" href="#recursos">Recursos</a></nav>}

      <section id="inicio" className="mx-auto max-w-7xl px-5 pb-12 pt-7 lg:px-8 lg:pt-12">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_.8fr] lg:items-end">
          <div>
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-forest"><Sparkles size={16} fill="currentColor"/> SEGUNDA-FEIRA, 24 DE AGOSTO</p>
            <h1 className="max-w-2xl font-display text-5xl leading-[.98] tracking-tight sm:text-6xl">Pequenos passos,<br/><span className="text-forest">grandes caminhos.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#587068]">Bom dia, Marina. Sua jornada acontece um dia de cada vez. Que tal continuar de onde você parou?</p>
          </div>
          <div className="rounded-[1.75rem] bg-forest p-6 text-white shadow-xl shadow-[#1d5647]/10">
            <div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-xl bg-white/12"><Flame size={22} className="text-[#f5cd75]" fill="currentColor"/></span><span className="text-sm text-white/65">Sequência atual</span></div>
            <div className="mt-5 flex items-end gap-2"><strong className="font-display text-5xl">12</strong><span className="mb-1 text-white/70">dias</span></div>
            <div className="mt-5 flex gap-1.5">{Array.from({length: 7}, (_, i) => <span key={i} className={`h-2 flex-1 rounded-full ${i < 5 ? 'bg-[#b5d47d]' : 'bg-white/20'}`}/>)}</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-[2rem] border border-[#e5e1d4] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-forest">FOCO DE HOJE</p><h2 className="mt-1 font-display text-3xl">Seus hábitos</h2></div><span className="rounded-full bg-[#eef4e5] px-3 py-1.5 text-sm font-semibold text-forest">{completeCount}/3 concluídos</span></div>
            <div className="mt-6 divide-y divide-[#ebe8dc]">{habits.map((habit, index) => <button key={habit.name} onClick={() => setCheckedHabits((current) => current.map((value, i) => i === index ? !value : value))} className="flex w-full items-center gap-4 py-4 text-left group"><span className={`grid size-11 shrink-0 place-items-center rounded-xl ${habit.color} text-forest`}>{checkedHabits[index] ? <Check size={20} strokeWidth={3}/> : <span className="size-3 rounded-full bg-forest/30"/>}</span><span className="flex-1"><strong className={`block ${checkedHabits[index] ? 'line-through text-[#82938d]' : ''}`}>{habit.name}</strong><small className="text-[#71847e]">{habit.detail}</small></span><ChevronRight size={18} className="text-[#9ba9a4] transition group-hover:translate-x-1"/></button>)}</div>
            <button className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-forest"><Plus size={17}/> Adicionar hábito</button>
          </div>
          <div className="rounded-[2rem] bg-[#e9f0df] p-6 sm:p-8">
            <p className="text-sm font-semibold text-forest">SEU PROGRESSO</p><h2 className="mt-1 font-display text-3xl">Seu ritmo importa.</h2>
            <div className="relative mx-auto mt-7 grid size-44 place-items-center rounded-full" style={{background: 'conic-gradient(#1d5647 0 68%, #cbdabb 68% 100%)'}}><div className="grid size-32 place-items-center rounded-full bg-[#e9f0df]"><strong className="font-display text-4xl">68%</strong><span className="-mt-6 text-xs text-[#587068]">da trilha</span></div></div>
            <p className="mt-6 text-center text-sm leading-relaxed text-[#527067]">Você avançou 3 etapas este mês.<br/>Continue assim, sem pressa.</p>
          </div>
        </div>
      </section>

      <section id="trilha" className="border-y border-[#e5e1d4] bg-[#f1eee4] py-16"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-forest">CAMINHO EM CONSTRUÇÃO</p><h2 className="mt-1 font-display text-4xl">Minha trilha</h2></div><button className="inline-flex items-center gap-2 text-sm font-bold text-forest">Ver trilha completa <ArrowUpRight size={17}/></button></div><div className="relative mt-10 grid gap-4 md:grid-cols-3 before:absolute before:top-8 before:hidden before:h-px before:w-2/3 before:bg-[#b5c8a6] md:before:block">{milestones.map((item, i) => <article key={item.title} className="relative rounded-2xl bg-white p-5 shadow-sm"><span className={`mb-8 grid size-9 place-items-center rounded-full ${item.done ? 'bg-forest text-white' : i === 1 ? 'border-4 border-[#b5d47d] bg-forest text-white' : 'bg-[#e9f0df] text-forest'}`}>{item.done ? <Check size={17}/> : i + 1}</span><p className="text-xs font-bold uppercase tracking-wide text-[#71847e]">{item.status}</p><h3 className="mt-1 text-lg font-bold">{item.title}</h3><p className="mt-1 text-sm text-[#71847e]">{item.subtitle}</p></article>)}</div></div></section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-[#71847e] sm:flex-row sm:items-center sm:justify-between lg:px-8"><p>© 2026 Trilha de Crescimento</p><div className="flex gap-4"><a href="#inicio">Privacidade</a><a href="#inicio">Ajuda</a></div></footer>
    </main>
  )
}

export default App
