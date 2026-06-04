'use client'

import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════════
   DASHBOARD TAB — click tasks to mark complete
═══════════════════════════════════════════════════════════════════ */
function DashboardMockup() {
  const [done, setDone] = useState<Set<string>>(new Set())

  const tasks = [
    { id: 't1', title: 'Finalize Q3 report',       project: 'Strategy',          priority: '#f97316' },
    { id: 't2', title: 'Review design mockups',     project: 'Website Redesign',  priority: '#eab308' },
    { id: 't3', title: 'Send client proposal',      project: 'Agency Work',       priority: '#ef4444' },
    { id: 't4', title: 'Update staging deploy',     project: 'Product',           priority: '#6366f1' },
  ]

  const completedCount = done.size
  const stats = [
    { label: 'Due Today',      value: String(tasks.length - completedCount), color: '#f97316' },
    { label: 'Overdue',        value: '2',                                   color: '#ef4444' },
    { label: 'Active Tasks',   value: '18',                                  color: '#111' },
    { label: 'Done This Week', value: String(11 + completedCount),           color: '#22c55e' },
    { label: 'Pending Review', value: '3',                                   color: '#d97706' },
  ]

  return (
    <div className="bg-[#FAFAF8] rounded-lg h-full min-h-[400px] p-5 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-2.5">
        {stats.map(s => (
          <motion.div
            key={s.label}
            layout
            className="bg-white rounded-lg border border-gray-100 p-3"
          >
            <p className="text-[10px] text-gray-500 mb-1 leading-tight">{s.label}</p>
            <motion.p key={s.value} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-xl font-bold" style={{ color: s.color }}>{s.value}</motion.p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Task list */}
        <div className="col-span-2 space-y-2">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Due Today — click to complete</p>
          <AnimatePresence>
            {tasks.map(t => {
              const isDone = done.has(t.id)
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: isDone ? 0.45 : 1, x: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                  onClick={() => setDone(prev => { const n = new Set(prev); isDone ? n.delete(t.id) : n.add(t.id); return n })}
                  className="flex items-center gap-2.5 bg-white rounded-lg border border-gray-100 px-3 py-2 cursor-pointer hover:border-gray-200 select-none"
                >
                  <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: isDone ? '#94a3b8' : t.priority }} />
                  <span className={`text-[12px] font-medium flex-1 transition-all ${isDone ? 'line-through text-gray-300' : 'text-gray-800'}`}>
                    {t.title}
                  </span>
                  {isDone
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    : <Circle className="h-4 w-4 text-gray-200 shrink-0" />
                  }
                </motion.div>
              )
            })}
          </AnimatePresence>
          {completedCount === tasks.length && (
            <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-[12px] text-emerald-600 font-medium text-center py-2">
              ✓ All done for today!
            </motion.p>
          )}
        </div>

        {/* Activity feed */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Recent Activity</p>
          {[
            { name: 'Priya S.',  action: 'completed a task',   time: '2m ago',  color: '#6366f1' },
            { name: 'Rahul M.',  action: 'requested review',   time: '14m ago', color: '#ec4899' },
            { name: 'Ananya I.', action: 'created a project',  time: '1h ago',  color: '#f97316' },
            { name: 'Dev T.',    action: 'approved task',       time: '2h ago',  color: '#6366f1' },
          ].map(a => (
            <div key={a.name} className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0" style={{ backgroundColor: a.color }}>
                {a.name[0]}
              </div>
              <div>
                <p className="text-[11px] text-gray-700"><span className="font-medium">{a.name}</span> {a.action}</p>
                <p className="text-[10px] text-gray-400">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   BOARD TAB — click a card to advance it to the next column
═══════════════════════════════════════════════════════════════════ */
type ColId = 'todo' | 'inProgress' | 'done'
const NEXT_COL: Record<ColId, ColId | null> = { todo: 'inProgress', inProgress: 'done', done: null }
const COL_COLOR_MAP: Record<ColId, string> = { todo: '#94a3b8', inProgress: '#3b82f6', done: '#22c55e' }

function BoardMockupSmall() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Redesign hero section', priority: '#f97316', col: 'todo'       as ColId },
    { id: 2, title: 'Write onboarding copy', priority: '#eab308', col: 'todo'       as ColId },
    { id: 3, title: 'Set up CI/CD pipeline', priority: '#6366f1', col: 'todo'       as ColId },
    { id: 4, title: 'API for payment flow',  priority: '#ef4444', col: 'inProgress' as ColId },
    { id: 5, title: 'Design system tokens',  priority: '#f97316', col: 'inProgress' as ColId },
    { id: 6, title: 'User interviews',       priority: '#eab308', col: 'done'       as ColId },
    { id: 7, title: 'Competitor analysis',   priority: '#6366f1', col: 'done'       as ColId },
  ])
  const [hint, setHint] = useState(true)

  function advance(id: number, col: ColId) {
    const next = NEXT_COL[col]
    if (!next) return
    setHint(false)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, col: next } : t))
  }

  return (
    <div className="bg-[#FAFAF8] rounded-lg min-h-[400px] p-4">
      {hint && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-[#4F46E5] text-center mb-3 font-medium">
          👆 Click any task card to move it forward
        </motion.p>
      )}
      <div className="grid grid-cols-3 gap-3 h-full">
        {(['todo', 'inProgress', 'done'] as ColId[]).map(colId => {
          const colTasks = tasks.filter(t => t.col === colId)
          return (
            <div key={colId} className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COL_COLOR_MAP[colId] }} />
                <span className="text-[11px] font-semibold text-gray-600">
                  {colId === 'todo' ? 'To Do' : colId === 'inProgress' ? 'In Progress' : 'Done'}
                </span>
                <span className="text-[9px] text-gray-400 bg-gray-100 rounded-full px-1">{colTasks.length}</span>
              </div>
              <AnimatePresence mode="popLayout">
                {colTasks.map(t => (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 8 }}
                    transition={{ duration: 0.22 }}
                    onClick={() => advance(t.id, t.col)}
                    whileHover={NEXT_COL[t.col] ? { y: -2, boxShadow: '0 4px 14px rgba(79,70,229,0.2)', borderColor: '#4F46E5' } : {}}
                    className="bg-white rounded-lg border border-gray-100 p-2.5 shadow-sm select-none"
                    style={{ cursor: NEXT_COL[t.col] ? 'pointer' : 'default' }}
                  >
                    <p className={`text-[11px] font-medium leading-tight mb-1.5 ${t.col === 'done' ? 'line-through text-gray-300' : 'text-gray-800'}`}>
                      {t.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: t.priority }} />
                      {NEXT_COL[t.col] && (
                        <span className="text-[9px] text-[#4F46E5] opacity-60 font-medium">
                          {t.col === 'todo' ? '→ In Progress' : '→ Done'}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   WORKLOAD TAB — bars animate when tab becomes visible; click member
═══════════════════════════════════════════════════════════════════ */
function WorkloadMockup() {
  const [selected, setSelected] = useState<string | null>(null)
  const ref = useRef(null)
  const visible = useInView(ref, { once: false })

  const members = [
    { name: 'Priya Sharma',  role: 'Manager', tasks: 9, load: 88, color: '#6366f1',
      breakdown: ['Redesign hero (Website)', 'Logo variations (Brand)', 'Color system docs (Brand)', 'Q3 planning (Strategy)'] },
    { name: 'Rahul Mehta',   role: 'Admin',   tasks: 5, load: 42, color: '#ec4899',
      breakdown: ['API integration (Product)', 'DB migration (Infra)', 'Code review (Product)'] },
    { name: 'Ananya Iyer',   role: 'Member',  tasks: 3, load: 28, color: '#f97316',
      breakdown: ['User research (UX)', 'Survey analysis (UX)'] },
  ]

  return (
    <div ref={ref} className="bg-[#FAFAF8] rounded-lg min-h-[400px] p-5 space-y-4">
      <p className="text-[11px] text-[#4F46E5] font-medium">👆 Click a team member to see their tasks</p>
      {members.map(m => (
        <motion.div
          key={m.name}
          onClick={() => setSelected(s => s === m.name ? null : m.name)}
          className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer"
          whileHover={{ borderColor: '#4F46E5', boxShadow: '0 0 0 1px #4F46E520' }}
          transition={{ duration: 0.15 }}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ backgroundColor: m.color }}>
                {m.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-gray-800">{m.name}</span>
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{m.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500">{m.tasks} tasks · {m.load}%</span>
                    {selected === m.name ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
                  </div>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={visible ? { width: `${m.load}%` } : { width: 0 }}
                    transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
                    style={{ backgroundColor: m.load > 80 ? '#ef4444' : m.load > 60 ? '#f97316' : '#22c55e' }}
                  />
                </div>
              </div>
            </div>
          </div>
          <AnimatePresence>
            {selected === m.name && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="border-t border-gray-50 overflow-hidden"
              >
                {m.breakdown.map(task => (
                  <div key={task} className="flex items-center gap-2.5 px-4 py-2 border-b border-gray-50 last:border-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                    <span className="text-[11px] text-gray-600">{task}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   TEAM TAB — click to expand/collapse member task list
═══════════════════════════════════════════════════════════════════ */
function TeamMockup() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['Priya Sharma']))

  const people = [
    {
      name: 'Priya Sharma',  email: 'priya@agency.co', tasks: 9, overdue: 2,
      projects: ['Website Redesign', 'Brand Identity'],
      taskList: [
        { title: 'Redesign hero section', project: 'Website', date: 'Jun 12' },
        { title: 'Logo variations',       project: 'Brand',   date: 'Jun 14' },
        { title: 'Color system docs',     project: 'Brand',   date: 'Jun 18' },
      ],
    },
    {
      name: 'Rahul Mehta',   email: 'rahul@agency.co', tasks: 5, overdue: 0,
      projects: ['Website Redesign', 'App Launch'],
      taskList: [
        { title: 'API integration',       project: 'App',     date: 'Jun 15' },
        { title: 'Code review',           project: 'Website', date: 'Jun 16' },
      ],
    },
    {
      name: 'Ananya Iyer',   email: 'ananya@agency.co', tasks: 3, overdue: 1,
      projects: ['UX Research'],
      taskList: [
        { title: 'User interviews',       project: 'UX',      date: 'Jun 13' },
      ],
    },
  ]

  function toggle(name: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  return (
    <div className="bg-[#FAFAF8] rounded-lg min-h-[400px] p-5 space-y-3">
      <p className="text-[11px] text-[#4F46E5] font-medium">👆 Click a member to see their tasks</p>
      {people.map(person => {
        const isOpen = expanded.has(person.name)
        return (
          <div key={person.name} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors select-none"
              onClick={() => toggle(person.name)}
            >
              <div className="h-9 w-9 rounded-full bg-[#4F46E5] flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                {person.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold">{person.name}</span>
                  {person.overdue > 0 && (
                    <span className="text-[10px] text-red-600 font-medium bg-red-50 px-1.5 py-0.5 rounded-full">⚠ {person.overdue} overdue</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-gray-500">{person.tasks} active tasks</span>
                  {person.projects.map(p => (
                    <span key={p} className="text-[10px] text-gray-400">· {p}</span>
                  ))}
                </div>
              </div>
              <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </motion.div>
            </div>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden border-t border-gray-50"
                >
                  {person.taskList.map(t => (
                    <div key={t.title} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                      <span className="flex-1 text-[11px] text-gray-700">{t.title}</span>
                      <span className="text-[10px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">{t.project}</span>
                      <span className="text-[10px] text-gray-400">{t.date}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SHOWCASE SECTION
═══════════════════════════════════════════════════════════════════ */
const TABS = [
  { id: 'dashboard', label: 'Dashboard', description: 'See everything that matters. Due today, overdue, pending reviews — all in one place. Click tasks to complete them.' },
  { id: 'board',     label: 'Board',     description: 'Kanban that actually works. Click any task to advance it through the workflow.' },
  { id: 'workload',  label: 'Workload',  description: "See who's overloaded before it becomes a problem. Click a member to see their full task list." },
  { id: 'team',      label: 'Team',      description: 'One person across three projects? See all their tasks and deadlines at a glance.' },
]

const MOCKUPS: Record<string, React.FC> = {
  dashboard: DashboardMockup,
  board:     BoardMockupSmall,
  workload:  WorkloadMockup,
  team:      TeamMockup,
}

export function LandingShowcase() {
  const [active, setActive] = useState('dashboard')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const ActiveMockup = MOCKUPS[active]

  return (
    <section id="showcase" className="py-28 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#888] mb-4">The product</p>
          <h2 className="text-[40px] sm:text-[52px] font-bold tracking-[-0.03em] text-[#111] leading-[1.1] max-w-xl">
            Everything your team needs. Nothing it doesn&apos;t.
          </h2>
        </motion.div>

        {/* Tab buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-4"
        >
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                active === tab.id
                  ? 'bg-[#111] text-white shadow-sm'
                  : 'bg-white border border-black/10 text-[#555] hover:text-[#111] hover:border-black/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Description */}
        <AnimatePresence mode="wait">
          <motion.p
            key={active}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-[15px] text-[#666] mb-5"
          >
            {TABS.find(t => t.id === active)?.description}
          </motion.p>
        </AnimatePresence>

        {/* Mockup window */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl border border-black/[0.08] overflow-hidden shadow-2xl bg-white"
        >
          {/* Window chrome */}
          <div className="bg-[#F5F5F3] border-b border-black/[0.06] px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-[11px] text-gray-400 bg-white border border-black/[0.08] rounded px-3 py-1">
                app.kaam.work — {TABS.find(t => t.id === active)?.label}
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="p-4"
            >
              <ActiveMockup />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
