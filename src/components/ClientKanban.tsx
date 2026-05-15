import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { CSSProperties, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { api } from '../api'
import type { TarefaKanban } from '../mockData'

export type { TarefaKanban }

const COLS = [
  { id: 'nao_iniciado', title: 'Não iniciado', db: ['backlog', 'todo'] as const },
  { id: 'desenvolvimento', title: 'Em desenvolvimento', db: ['doing'] as const },
  { id: 'revisao', title: 'Em revisão', db: ['review'] as const },
  { id: 'concluido', title: 'Concluído', db: ['done'] as const },
] as const

export type ColId = (typeof COLS)[number]['id']

function statusToColumn(status: string): ColId {
  if (status === 'doing') return 'desenvolvimento'
  if (status === 'review') return 'revisao'
  if (status === 'done') return 'concluido'
  return 'nao_iniciado'
}

function columnToDbStatus(col: ColId): string {
  if (col === 'nao_iniciado') return 'todo'
  if (col === 'desenvolvimento') return 'doing'
  if (col === 'revisao') return 'review'
  return 'done'
}

function KanbanCard({ t }: { t: TarefaKanban }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${t.id}`,
    data: { type: 'task', t },
  })
  const style: CSSProperties = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    opacity: isDragging ? 0.45 : 1,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="kanban-card"
      {...listeners}
      {...attributes}
    >
      <strong>{t.titulo}</strong>
      <div className="kanban-card-meta">v{t.versao}</div>
    </div>
  )
}

function KanbanColumn({
  colId,
  title,
  children,
}: {
  colId: ColId
  title: string
  children: ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${colId}` })
  return (
    <div className={`kanban-column ${isOver ? 'kanban-column--over' : ''}`}>
      <h3 className="kanban-column-title">{title}</h3>
      <div ref={setNodeRef} className="kanban-column-body">
        {children}
      </div>
    </div>
  )
}

type Props = {
  tarefas: TarefaKanban[]
  onTarefasUpdated: (list: TarefaKanban[]) => void
}

export default function ClientKanban({ tarefas, onTarefasUpdated }: Props) {
  const [active, setActive] = useState<TarefaKanban | null>(null)
  const [busy, setBusy] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const byCol = useMemo(() => {
    const m: Record<ColId, TarefaKanban[]> = {
      nao_iniciado: [],
      desenvolvimento: [],
      revisao: [],
      concluido: [],
    }
    for (const t of tarefas) {
      m[statusToColumn(t.status)].push(t)
    }
    return m
  }, [tarefas])

  function resolveTargetColumn(overId: string | undefined | null): ColId | null {
    if (!overId) return null
    if (overId.startsWith('col-')) return overId.replace('col-', '') as ColId
    if (overId.startsWith('task-')) {
      const id = Number(overId.replace('task-', ''))
      const t = tarefas.find((x) => x.id === id)
      return t ? statusToColumn(t.status) : null
    }
    return null
  }

  async function persistMove(task: TarefaKanban, col: ColId) {
    const newStatus = columnToDbStatus(col)
    if (task.status === newStatus) return
    setBusy(true)
    try {
      const res = await api<{ ok: boolean; tarefa: TarefaKanban }>('/ApiTarefa/moverStatus', {
        method: 'POST',
        body: JSON.stringify({ id: task.id, versao: task.versao, status: newStatus }),
      })
      const next = tarefas.map((x) => (x.id === task.id ? { ...res.tarefa } : x))
      onTarefasUpdated(next)
    } catch {
      onTarefasUpdated([...tarefas])
    } finally {
      setBusy(false)
    }
  }

  function onDragStart(e: DragStartEvent) {
    const id = String(e.active.id)
    if (!id.startsWith('task-')) return
    const tid = Number(id.replace('task-', ''))
    setActive(tarefas.find((t) => t.id === tid) ?? null)
  }

  function onDragEnd(e: DragEndEvent) {
    setActive(null)
    const tid = String(e.active.id)
    if (!tid.startsWith('task-')) return
    const taskId = Number(tid.replace('task-', ''))
    const task = tarefas.find((t) => t.id === taskId)
    if (!task) return
    const col = resolveTargetColumn(e.over?.id ? String(e.over.id) : null)
    if (!col) return
    void persistMove(task, col)
  }

  return (
    <div className="kanban-wrap">
      {busy ? <div className="kanban-busy">Salvando…</div> : null}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="kanban-board">
          {COLS.map((c) => (
            <KanbanColumn key={c.id} colId={c.id} title={c.title}>
              {byCol[c.id].map((t) => (
                <KanbanCard key={t.id} t={t} />
              ))}
            </KanbanColumn>
          ))}
        </div>
        <DragOverlay>{active ? <div className="kanban-card kanban-card--overlay">{active.titulo}</div> : null}</DragOverlay>
      </DndContext>
    </div>
  )
}
