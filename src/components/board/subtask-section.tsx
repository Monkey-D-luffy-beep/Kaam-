'use client'

import { useState, useTransition, useRef, useEffect, useCallback } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'
import { createSubtask, updateSubtask, deleteSubtask, getSubtasks } from '@/actions/subtasks'
import { toast } from 'sonner'

interface Subtask {
  id: string
  task_id: string
  title: string
  difficulty: number
  urgency: number
  time_min: number | null
  time_max: number | null
  is_completed: boolean
  workload_score: number
  position: number
}

function urgencyLabel(urgency: number): { text: string; color: string } {
  if (urgency >= 80) return { text: 'Extremely Urgent', color: 'text-red-500' }
  if (urgency >= 60) return { text: 'High',             color: 'text-orange-500' }
  if (urgency >= 40) return { text: 'Medium',           color: 'text-amber-500' }
  if (urgency >= 20) return { text: 'Low',              color: 'text-slate-500' }
  return                     { text: 'Minimal',         color: 'text-slate-400' }
}

function workloadColor(score: number): string {
  if (score >= 80) return 'bg-red-100 text-red-600'
  if (score >= 60) return 'bg-orange-100 text-orange-600'
  if (score >= 40) return 'bg-amber-100 text-amber-600'
  return 'bg-slate-100 text-slate-500'
}

function SubtaskRow({ subtask, onDelete }: { subtask: Subtask; onDelete: (id: string) => void }) {
  const [title, setTitle]           = useState(subtask.title)
  const [difficulty, setDifficulty] = useState(subtask.difficulty)
  const [urgency, setUrgency]       = useState(subtask.urgency)
  const [timeMin, setTimeMin]       = useState<string>(subtask.time_min?.toString() ?? '')
  const [timeMax, setTimeMax]       = useState<string>(subtask.time_max?.toString() ?? '')
  const [completed, setCompleted]   = useState(subtask.is_completed)
  const [expanded, setExpanded]     = useState(false)
  const [, startTransition]         = useTransition()

  const workloadScore = Math.round(urgency * 0.6 + difficulty * 0.4)
  const label = urgencyLabel(urgency)

  function save(fields: Parameters<typeof updateSubtask>[1]) {
    startTransition(async () => {
      await updateSubtask(subtask.id, fields)
    })
  }

  function toggleComplete() {
    const next = !completed
    setCompleted(next)
    save({ is_completed: next })
  }

  return (
    <div className={cn('rounded-lg border border-[#E8E8E5] bg-white overflow-hidden', completed && 'opacity-60')}>
      {/* Top row: checkbox + title + workload score */}
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          onClick={toggleComplete}
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
            completed ? 'bg-[#4F46E5] border-[#4F46E5]' : 'border-[#D4D4D0] hover:border-[#4F46E5]'
          )}
        >
          {completed && <Check className="h-2.5 w-2.5 text-white" />}
        </button>

        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={() => title.trim() && save({ title: title.trim() })}
          onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className={cn(
            'flex-1 text-[13px] outline-none bg-transparent text-[#1A1A1A] placeholder:text-[#BBB]',
            completed && 'line-through text-[#999]'
          )}
        />

        {/* Workload score chip */}
        <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0', workloadColor(workloadScore))}>
          {workloadScore}
        </span>

        {/* Expand / collapse */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-[11px] text-[#BBB] hover:text-[#666] shrink-0 transition-colors"
        >
          {expanded ? '▲' : '▼'}
        </button>

        <button
          onClick={() => onDelete(subtask.id)}
          className="text-[#CCC] hover:text-red-400 shrink-0 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Expanded sliders */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-[#F0F0EE] pt-3">
          {/* Urgency */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#999]">Urgency</span>
              <span className={cn('text-[11px] font-medium', label.color)}>{urgency} — {label.text}</span>
            </div>
            <Slider
              min={1} max={100} step={1}
              value={[urgency]}
              onValueChange={([v]) => setUrgency(v)}
              onValueCommit={([v]) => save({ urgency: v })}
              className="accent-[#4F46E5]"
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#999]">Difficulty</span>
              <span className="text-[11px] font-medium text-[#666]">{difficulty}</span>
            </div>
            <Slider
              min={1} max={100} step={1}
              value={[difficulty]}
              onValueChange={([v]) => setDifficulty(v)}
              onValueCommit={([v]) => save({ difficulty: v })}
            />
          </div>

          {/* Time estimate */}
          <div className="space-y-1">
            <span className="text-[11px] text-[#999]">Time estimate (hours)</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0.5} max={100} step={0.5}
                value={timeMin}
                onChange={e => setTimeMin(e.target.value)}
                onBlur={() => save({ time_min: timeMin ? parseFloat(timeMin) : null })}
                placeholder="Min"
                className="w-20 text-[12px] border border-[#E8E8E5] rounded px-2 py-1 outline-none focus:border-[#4F46E5] bg-white"
              />
              <span className="text-[11px] text-[#BBB]">to</span>
              <input
                type="number"
                min={0.5} max={500} step={0.5}
                value={timeMax}
                onChange={e => setTimeMax(e.target.value)}
                onBlur={() => save({ time_max: timeMax ? parseFloat(timeMax) : null })}
                placeholder="Max"
                className="w-20 text-[12px] border border-[#E8E8E5] rounded px-2 py-1 outline-none focus:border-[#4F46E5] bg-white"
              />
              <span className="text-[11px] text-[#BBB]">hrs</span>
            </div>
          </div>

          {/* Live workload summary */}
          <div className="flex items-center justify-between pt-1 border-t border-[#F0F0EE]">
            <span className="text-[11px] text-[#999]">Workload score</span>
            <div className="flex items-center gap-2">
              <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', workloadColor(workloadScore))}>
                {workloadScore}/100
              </span>
              <span className={cn('text-[11px] font-medium', label.color)}>{label.text}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function SubtaskSection({ taskId }: { taskId: string }) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [loading, setLoading]   = useState(true)
  const [adding, setAdding]     = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [, startTransition]     = useTransition()
  const inputRef                = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getSubtasks(taskId).then(data => {
      setSubtasks(data as Subtask[])
      setLoading(false)
    })
  }, [taskId])

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  function handleAdd() {
    const trimmed = newTitle.trim()
    if (!trimmed) { setAdding(false); return }
    const tempId = `temp-${Date.now()}`
    const optimistic: Subtask = {
      id: tempId, task_id: taskId, title: trimmed,
      difficulty: 50, urgency: 50, time_min: null, time_max: null,
      is_completed: false, workload_score: 50, position: subtasks.length,
    }
    setSubtasks(prev => [...prev, optimistic])
    setNewTitle('')
    startTransition(async () => {
      const result = await createSubtask(taskId, trimmed)
      if (!result.success) {
        setSubtasks(prev => prev.filter(s => s.id !== tempId))
        toast.error(result.message)
      } else {
        setSubtasks(prev => prev.map(s => s.id === tempId ? { ...s, id: result.data!.id } : s))
      }
    })
  }

  function handleDelete(id: string) {
    setSubtasks(prev => prev.filter(s => s.id !== id))
    startTransition(async () => {
      const result = await deleteSubtask(id)
      if (!result.success) toast.error(result.message)
    })
  }

  const completedCount = subtasks.filter(s => s.is_completed).length
  const totalWorkload  = subtasks.reduce((sum, s) => sum + (s.workload_score ?? 0), 0)
  const avgWorkload    = subtasks.length > 0 ? Math.round(totalWorkload / subtasks.length) : 0

  if (loading) return <div className="text-[12px] text-[#BBB] py-2">Loading subtasks…</div>

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#37352F] uppercase tracking-wide">Subtasks</span>
          {subtasks.length > 0 && (
            <span className="text-[11px] text-[#999]">{completedCount}/{subtasks.length}</span>
          )}
        </div>
        {subtasks.length > 0 && (
          <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full', workloadColor(avgWorkload))}>
            avg {avgWorkload}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {subtasks.length > 0 && (
        <div className="h-1 bg-[#F0F0EE] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4F46E5] rounded-full transition-all"
            style={{ width: `${(completedCount / subtasks.length) * 100}%` }}
          />
        </div>
      )}

      {/* Subtask rows */}
      <div className="space-y-1.5">
        {subtasks.map(s => (
          <SubtaskRow key={s.id} subtask={s} onDelete={handleDelete} />
        ))}
      </div>

      {/* Inline add */}
      {adding ? (
        <div className="flex items-center gap-2 rounded-lg border border-[#4F46E5]/30 bg-white px-3 py-2 shadow-[0_0_0_2px_rgba(79,70,229,0.08)]">
          <input
            ref={inputRef}
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); handleAdd() }
              if (e.key === 'Escape') { setAdding(false); setNewTitle('') }
            }}
            onBlur={() => { if (!newTitle.trim()) setAdding(false) }}
            placeholder="Subtask name…"
            className="flex-1 text-[13px] outline-none bg-transparent text-[#1A1A1A] placeholder:text-[#BBB]"
          />
          <span className="text-[10px] text-[#CCC] select-none shrink-0">↵ add · Esc cancel</span>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-[12px] text-[#BBB] hover:text-[#37352F] transition-colors py-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Add subtask
        </button>
      )}
    </div>
  )
}
