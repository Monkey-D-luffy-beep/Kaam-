'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react'
import { useState, useEffect, useRef, useReducer } from 'react'

/* ════════════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════════════ */
type ColId   = 'todo' | 'inProgress' | 'done'
type ViewTab = 'Board' | 'Timeline' | 'Workload' | 'Team'

interface Task {
  id: number; title: string; priority: 'urgent' | 'high' | 'medium' | 'low'
  assignee: string; color: string; col: ColId; scratched: boolean
}

/* ════════════════════════════════════════════════════════════════════
   BOARD ANIMATION DATA
════════════════════════════════════════════════════════════════════ */
const INIT: Task[] = [
  { id: 1, title: 'Redesign homepage hero',     priority: 'high',   assignee: 'PR', color: '#6366f1', col: 'todo',       scratched: false },
  { id: 2, title: 'Write onboarding copy',      priority: 'medium', assignee: 'AL', color: '#ec4899', col: 'todo',       scratched: false },
  { id: 3, title: 'Set up CI/CD pipeline',      priority: 'low',    assignee: 'RK', color: '#6366f1', col: 'todo',       scratched: false },
  { id: 4, title: 'API integration — payments', priority: 'urgent', assignee: 'RK', color: '#f97316', col: 'inProgress', scratched: false },
  { id: 5, title: 'Design system tokens',       priority: 'high',   assignee: 'PR', color: '#6366f1', col: 'inProgress', scratched: false },
  { id: 6, title: 'User research interviews',   priority: 'medium', assignee: 'AL', color: '#ec4899', col: 'done',       scratched: false },
  { id: 7, title: 'Competitor analysis',        priority: 'low',    assignee: 'RK', color: '#f97316', col: 'done',       scratched: false },
]
const EXTRA: Task[] = [
  { id: 8,  title: 'Launch beta announcement', priority: 'high',   assignee: 'PR', color: '#6366f1', col: 'todo', scratched: false },
  { id: 9,  title: 'Create social media kit',  priority: 'medium', assignee: 'AL', color: '#ec4899', col: 'todo', scratched: false },
  { id: 10, title: 'Client onboarding flow',   priority: 'urgent', assignee: 'RK', color: '#f97316', col: 'todo', scratched: false },
]
const P_COLOR:   Record<string, string>  = { urgent: '#ef4444', high: '#f97316', medium: '#eab308', low: '#94a3b8' }
const COL_COLOR: Record<ColId, string>   = { todo: '#94a3b8', inProgress: '#3b82f6', done: '#22c55e' }
const COL_LABEL: Record<ColId, string>   = { todo: 'To Do', inProgress: 'In Progress', done: 'Done' }

type BoardAction =
  | { type: 'move';    id: number; to: ColId; toast: { actor: string; label: string } }
  | { type: 'scratch'; id: number }
  | { type: 'remove';  ids: number[] }
  | { type: 'add';     task: Task }
  | { type: 'reset' }

interface BoardState { tasks: Task[]; toast: { actor: string; label: string } | null }

function boardReducer(s: BoardState, a: BoardAction): BoardState {
  switch (a.type) {
    case 'move':    return { tasks: s.tasks.map(t => t.id === a.id ? { ...t, col: a.to } : t), toast: a.toast }
    case 'scratch': return { ...s, tasks: s.tasks.map(t => t.id === a.id ? { ...t, scratched: true } : t) }
    case 'remove':  return { ...s, tasks: s.tasks.filter(t => !a.ids.includes(t.id)) }
    case 'add':     return { ...s, tasks: [...s.tasks, { ...a.task }] }
    case 'reset':   return { tasks: INIT.map(t => ({ ...t })), toast: null }
  }
}

const ANIM_TIMELINE: Array<{ at: number; action: BoardAction }> = [
  { at: 2000,  action: { type: 'move',    id: 2,  to: 'inProgress', toast: { actor: 'AL', label: 'moved to In Progress' } } },
  { at: 4600,  action: { type: 'move',    id: 4,  to: 'done',       toast: { actor: 'RK', label: 'marked Done ✓' } } },
  { at: 5100,  action: { type: 'scratch', id: 4 } },
  { at: 6800,  action: { type: 'remove',  ids: [4, 6] } },
  { at: 7100,  action: { type: 'add',     task: EXTRA[0] } },
  { at: 9800,  action: { type: 'move',    id: 1,  to: 'inProgress', toast: { actor: 'PR', label: 'moved to In Progress' } } },
  { at: 12400, action: { type: 'move',    id: 3,  to: 'inProgress', toast: { actor: 'RK', label: 'moved to In Progress' } } },
  { at: 15000, action: { type: 'move',    id: 5,  to: 'done',       toast: { actor: 'PR', label: 'marked Done ✓' } } },
  { at: 15500, action: { type: 'scratch', id: 5 } },
  { at: 17200, action: { type: 'remove',  ids: [5, 7] } },
  { at: 17500, action: { type: 'add',     task: EXTRA[1] } },
  { at: 20100, action: { type: 'move',    id: 2,  to: 'done',       toast: { actor: 'AL', label: 'marked Done ✓' } } },
  { at: 20600, action: { type: 'scratch', id: 2 } },
  { at: 22300, action: { type: 'remove',  ids: [2] } },
  { at: 22600, action: { type: 'add',     task: EXTRA[2] } },
  { at: 25200, action: { type: 'move',    id: 8,  to: 'inProgress', toast: { actor: 'PR', label: 'moved to In Progress' } } },
  { at: 27800, action: { type: 'move',    id: 1,  to: 'done',       toast: { actor: 'PR', label: 'marked Done ✓' } } },
  { at: 28300, action: { type: 'scratch', id: 1 } },
  { at: 30000, action: { type: 'remove',  ids: [1] } },
]
const LOOP_MS = 32000

/* ════════════════════════════════════════════════════════════════════
   BOARD VIEW
════════════════════════════════════════════════════════════════════ */
function BoardView({ state }: { state: BoardState }) {
  return (
    <div className="bg-[#FAFAF8] p-3 grid grid-cols-3 gap-2.5" style={{ minHeight: 420 }}>
      {(['todo', 'inProgress', 'done'] as ColId[]).map(colId => {
        const colTasks = state.tasks.filter(t => t.col === colId)
        return (
          <div key={colId} className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 px-1 py-1">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COL_COLOR[colId] }} />
              <span className="text-[12px] font-semibold text-gray-500">{COL_LABEL[colId]}</span>
              <motion.span key={colTasks.length} initial={{ scale: 1.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="text-[10px] text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5 font-medium">
                {colTasks.length}
              </motion.span>
            </div>
            <div className="flex flex-col gap-1.5" style={{ minHeight: 280 }}>
              <AnimatePresence mode="popLayout">
                {colTasks.map(task => (
                  <motion.div key={task.id} layout
                    initial={{ opacity: 0, scale: 0.88, y: -12 }}
                    animate={{ opacity: task.scratched ? 0.5 : 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 12, transition: { duration: 0.28 } }}
                    transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
                    className="relative bg-white rounded-lg border border-gray-100 p-3 shadow-sm overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg" style={{ backgroundColor: task.color }} />
                    <div className="relative pl-1 mb-2.5">
                      <p className={`text-[12.5px] font-medium leading-snug transition-colors duration-300 ${task.scratched ? 'text-gray-300' : 'text-[#111]'}`}>
                        {task.title}
                      </p>
                      {task.scratched && (
                        <div className="absolute inset-y-0 left-1 right-0 flex items-center pointer-events-none">
                          <motion.div className="h-[1.5px] bg-gray-300 rounded-full" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.4 }} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pl-1">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ color: P_COLOR[task.priority], backgroundColor: `${P_COLOR[task.priority]}18` }}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      <div className="h-6 w-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0" style={{ backgroundColor: task.color }}>
                        {task.assignee}
                      </div>
                    </div>
                    {task.col === 'done' && !task.scratched && (
                      <motion.div className="absolute inset-0 bg-green-50 rounded-lg pointer-events-none" initial={{ opacity: 0.35 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   TIMELINE VIEW  — dark calendar matching the screenshot style
════════════════════════════════════════════════════════════════════ */
const TL_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI']

const TL_WEEKS = [
  {
    dates: [26, 27, 28, 29, 30],
    tasks: [] as Array<{ title: string; start: number; span: number; color: string; row: number }>,
  },
  {
    dates: [2, 3, 4, 5, 6],
    today: 1, // index of today (Tue = 3 Jun)
    tasks: [
      { title: 'Redesign homepage hero', start: 0, span: 3, color: '#4F46E5', row: 0 },
      { title: 'Write onboarding copy',  start: 0, span: 2, color: '#ec4899', row: 1 },
      { title: 'API integration',        start: 2, span: 3, color: '#f97316', row: 2 },
    ],
  },
  {
    dates: [9, 10, 11, 12, 13],
    tasks: [
      { title: 'Design system tokens',   start: 0, span: 3, color: '#6366f1', row: 0 },
      { title: 'CI/CD pipeline',         start: 1, span: 2, color: '#6366f1', row: 1 },
      { title: 'Launch beta',            start: 3, span: 2, color: '#22c55e', row: 2 },
    ],
  },
]

function TimelineView() {
  return (
    <div className="bg-[#111] rounded-b-none" style={{ minHeight: 420 }}>
      {/* Calendar header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.08]">
        <button className="h-6 w-6 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
          <ChevronLeft className="h-3.5 w-3.5 text-white/50" />
        </button>
        <span className="text-[12px] font-medium text-white/70 cursor-pointer hover:text-white">Today</span>
        <button className="h-6 w-6 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
          <ChevronRightIcon className="h-3.5 w-3.5 text-white/50" />
        </button>
        <span className="text-[13px] font-semibold text-white ml-1">June 2026</span>
        <span className="ml-auto text-[11px] text-white/40 border border-white/10 rounded px-2 py-0.5">Weeks</span>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-5 border-b border-white/[0.06]">
        {TL_DAYS.map(d => (
          <div key={d} className="text-[10px] text-white/30 text-center py-2 font-semibold tracking-widest">{d}</div>
        ))}
      </div>

      {/* Weeks */}
      {TL_WEEKS.map((week, wi) => (
        <div key={wi}>
          {/* Date row */}
          <div className="grid grid-cols-5 border-b border-white/[0.04]">
            {week.dates.map((date, di) => {
              const isToday = 'today' in week && week.today === di
              return (
                <div key={date} className="flex items-start justify-center pt-2 pb-1">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-medium ${
                    isToday ? 'bg-blue-500 text-white' : 'text-white/35'
                  }`}>
                    {date}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Task bars row */}
          <div className="relative" style={{ minHeight: week.tasks.length > 0 ? `${week.tasks.length * 28 + 10}px` : '20px' }}>
            {week.tasks.map(task => (
              <motion.div
                key={`${wi}-${task.title}`}
                initial={{ opacity: 0, scaleX: 0.6 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.35, delay: wi * 0.12 + task.row * 0.06, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  left:   `calc(${(task.start / 5) * 100}% + 3px)`,
                  width:  `calc(${(task.span  / 5) * 100}% - 6px)`,
                  top:    `${task.row * 28 + 5}px`,
                  backgroundColor: task.color,
                  transformOrigin: 'left center',
                }}
                className="h-6 rounded text-white text-[10px] font-medium flex items-center px-2 overflow-hidden whitespace-nowrap"
              >
                {task.title}
              </motion.div>
            ))}
          </div>

          {/* Row divider */}
          {wi < TL_WEEKS.length - 1 && (
            <div className="border-b border-white/[0.06]" />
          )}
        </div>
      ))}

      {/* Add task hint */}
      <div className="px-4 py-3 text-center">
        <span className="text-[11px] text-white/20 cursor-pointer hover:text-white/40 transition-colors">+ Add task</span>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   WORKLOAD VIEW
════════════════════════════════════════════════════════════════════ */
function WorkloadView() {
  const members = [
    { name: 'Priya Sharma',  initials: 'PR', load: 88, tasks: 9, color: '#6366f1', over: true  },
    { name: 'Rahul Mehta',   initials: 'RK', load: 42, tasks: 5, color: '#ec4899', over: false },
    { name: 'Ananya Iyer',   initials: 'AL', load: 28, tasks: 3, color: '#f97316', over: false },
  ]

  return (
    <div className="bg-[#FAFAF8] p-5 space-y-4" style={{ minHeight: 420 }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[12px] font-semibold text-gray-600">Team Workload — This Sprint</p>
        <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">1 overloaded</span>
      </div>

      {members.map(m => (
        <div key={m.name} className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full text-white text-[12px] font-bold flex items-center justify-center shrink-0" style={{ backgroundColor: m.color }}>
              {m.initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-semibold text-gray-800">{m.name}</span>
                <span className="text-[11px] text-gray-500">{m.tasks} tasks · <span className="font-semibold" style={{ color: m.load > 80 ? '#ef4444' : '#22c55e' }}>{m.load}%</span></span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${m.load}%` }}
                  transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
                  style={{ backgroundColor: m.load > 80 ? '#ef4444' : m.load > 60 ? '#f97316' : '#22c55e' }}
                />
              </div>
            </div>
          </div>
          {m.over && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 font-medium">
              ⚠ Overloaded — consider reassigning 2–3 tasks
            </motion.div>
          )}
        </div>
      ))}

      <div className="bg-[#4F46E5]/[0.06] border border-[#4F46E5]/15 rounded-xl p-4 text-center">
        <p className="text-[12px] text-[#4F46E5] font-medium">Team capacity: 53% average</p>
        <p className="text-[11px] text-gray-500 mt-0.5">2 members have bandwidth for more work</p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   TEAM VIEW
════════════════════════════════════════════════════════════════════ */
function TeamView() {
  const [expanded, setExpanded] = useState<number | null>(0)

  const people = [
    { id: 0, name: 'Priya Sharma',  role: 'Manager', tasks: 9,  overdue: 2, color: '#6366f1',
      items: ['Redesign homepage hero · Jun 12', 'Design system tokens · Jun 14', 'Launch beta review · Jun 18'] },
    { id: 1, name: 'Rahul Mehta',   role: 'Admin',   tasks: 5,  overdue: 0, color: '#ec4899',
      items: ['API integration · Jun 15', 'Code review session · Jun 16'] },
    { id: 2, name: 'Ananya Iyer',   role: 'Member',  tasks: 3,  overdue: 1, color: '#f97316',
      items: ['User research interviews · Jun 13'] },
  ]

  return (
    <div className="bg-[#FAFAF8] p-4 space-y-3" style={{ minHeight: 420 }}>
      <p className="text-[11px] text-[#4F46E5] font-medium px-1">👆 Click to expand</p>
      {people.map(p => (
        <div key={p.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 p-3.5 cursor-pointer hover:bg-gray-50 transition-colors select-none"
            onClick={() => setExpanded(e => e === p.id ? null : p.id)}>
            <div className="h-8 w-8 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0" style={{ backgroundColor: p.color }}>
              {p.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold">{p.name}</span>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{p.role}</span>
                {p.overdue > 0 && <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">⚠ {p.overdue} overdue</span>}
              </div>
              <span className="text-[11px] text-gray-500">{p.tasks} active tasks</span>
            </div>
            <motion.span animate={{ rotate: expanded === p.id ? 90 : 0 }} transition={{ duration: 0.18 }} className="text-gray-300 text-sm">›</motion.span>
          </div>
          <AnimatePresence initial={false}>
            {expanded === p.id && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                transition={{ duration: 0.2 }} className="overflow-hidden border-t border-gray-50">
                {p.items.map(item => (
                  <div key={item} className="flex items-center gap-2.5 px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                    <span className="text-[11px] text-gray-600">{item}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   MAIN BOARD MOCKUP (container with tab switching)
════════════════════════════════════════════════════════════════════ */
function LiveBoardMockup() {
  const [view, setView]     = useState<ViewTab>('Board')
  const [state, dispatch]   = useReducer(boardReducer, { tasks: INIT.map(t => ({ ...t })), toast: null })
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  // Board animation always runs in background regardless of active tab
  useEffect(() => {
    function runLoop() {
      dispatch({ type: 'reset' })
      timers.current.forEach(clearTimeout)
      timers.current = []
      ANIM_TIMELINE.forEach(({ at, action }) => {
        const t = setTimeout(() => dispatch(action), at)
        timers.current.push(t)
      })
      timers.current.push(setTimeout(runLoop, LOOP_MS))
    }
    runLoop()
    return () => timers.current.forEach(clearTimeout)
  }, [])

  const TABS: ViewTab[] = ['Board', 'Timeline', 'Workload', 'Team']

  return (
    <div className="w-full rounded-xl overflow-hidden border border-black/[0.08] shadow-2xl bg-white">
      {/* Window chrome */}
      <div className="bg-[#F5F5F3] border-b border-black/[0.06] px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
          <div className="h-3 w-3 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-white rounded-md px-3 py-1 border border-black/[0.08] text-[12px] text-gray-500">
            <div className="h-2 w-2 rounded-full bg-[#4F46E5]" />
            Website Redesign
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
            </span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className={`border-b border-gray-100 px-3 py-2 flex items-center gap-1 min-h-[40px] ${view === 'Timeline' ? 'bg-[#111]' : 'bg-white'}`}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setView(tab)}
            className={`text-[12px] px-3 py-1.5 rounded-md font-medium transition-all ${
              view === tab
                ? view === 'Timeline' ? 'bg-white/15 text-white' : 'bg-[#111] text-white'
                : view === 'Timeline' ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-700'
            }`}>
            {tab}
          </button>
        ))}
        {view === 'Board' && (
          <AnimatePresence mode="popLayout">
            {state.toast && (
              <motion.div key={state.toast.label}
                initial={{ opacity: 0, x: 12, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18 }}
                className="ml-auto flex items-center gap-1.5 bg-[#111] text-white text-[11px] px-3 py-1.5 rounded-lg font-medium">
                <span className="opacity-70">{state.toast.actor}</span>
                <span>{state.toast.label}</span>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
          {view === 'Board'    && <BoardView    state={state} />}
          {view === 'Timeline' && <TimelineView />}
          {view === 'Workload' && <WorkloadView />}
          {view === 'Team'     && <TeamView />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   HERO SECTION
════════════════════════════════════════════════════════════════════ */
export function LandingHero() {
  return (
    <section className="min-h-screen pt-24 pb-16 px-6 flex items-center overflow-hidden">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
              className="text-[52px] sm:text-[64px] leading-[1.05] font-bold tracking-[-0.03em] text-[#111111] mb-6">
              Less software.
              <br />
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #1a1a2e 0%, #4F46E5 50%, #7C3AED 100%)', WebkitBackgroundClip: 'text' }}>
                More Kaam.
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[17px] text-[#555] leading-relaxed mb-10 max-w-md">
              Tasks, approvals, team workload, and client updates — one place, zero clutter. Watch the board — it&apos;s live right now.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-wrap items-center gap-3">
              <Link href="/signup"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-lg text-white text-[14px] font-semibold transition-all hover:brightness-110"
                style={{ backgroundColor: '#4F46E5' }}>
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#showcase"
                className="inline-flex items-center h-11 px-6 rounded-lg border border-[#111]/15 text-[#111] text-[14px] font-medium hover:bg-black/[0.04] transition-colors">
                See all features
              </Link>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-5 text-[12px] text-[#888]">
              Free to start · Works in 60 seconds
            </motion.p>
          </div>

          <motion.div initial={{ opacity: 0, x: 40, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative hidden lg:block">
            <div className="absolute -inset-8 bg-gradient-to-tr from-[#4F46E5]/6 via-transparent to-[#818CF8]/6 rounded-3xl blur-3xl pointer-events-none" />
            <LiveBoardMockup />
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-16 pt-10 border-t border-black/[0.06] flex flex-wrap items-center gap-x-8 gap-y-2 text-[14px] text-[#666]">
          {[
            'Project management, made simple.',
            'Built for agencies & small teams.',
            'Your team. Your workflow.',
          ].map((text, i) => (
            <span key={text} className="flex items-center gap-2">
              {i > 0 && <span className="hidden sm:block h-1 w-1 rounded-full bg-[#ccc]" />}
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
