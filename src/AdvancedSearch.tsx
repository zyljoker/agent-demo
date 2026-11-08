import { useState } from 'react'
import MultiSelect, { type SelectOption } from './MultiSelect'
import { moduleOptions } from './data'
import type { Filters, Mode, ResourceType, Task, TaskStatus } from './filtering'

interface AdvancedSearchProps {
  mode: Mode
  draft: Filters
  availableTasks: Task[]
  error: string
  onChange: (next: Filters) => void
  onApply: () => void
  onReset: () => void
  onClose: () => void
}

const statuses: TaskStatus[] = ['已完成', '已取消', '异常']

export default function AdvancedSearch({ mode, draft, availableTasks, error, onChange, onApply, onReset, onClose }: AdvancedSearchProps) {
  const [openSelect, setOpenSelect] = useState<string | null>(null)
  const premium = mode !== 'uncertified'
  const unique = (values: string[]) => [...new Set(values)]
  const users: SelectOption[] = unique(availableTasks.map((task) => task.user)).map((user) => {
    const row = availableTasks.find((task) => task.user === user)!
    return { value: user, label: user, group: mode === 'private' ? undefined : row.userKind === 'internal' ? '内部成员' : '外部成员' }
  })
  const spaces: SelectOption[] = unique(availableTasks.map((task) => task.space)).map((space) => ({ value: space, label: space }))
  const resources: SelectOption[] = (mode === 'private' ? ['CPU', 'GPU'] : ['CPU']).map((value) => ({ value, label: value }))
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...draft, [key]: value })
  const select = (name: string) => ({ open: openSelect === name, onToggle: () => setOpenSelect(openSelect === name ? null : name) })

  return (
    <section className="advanced-panel" role="dialog" aria-modal="false" aria-labelledby="advanced-title" onKeyDown={(event) => { if (event.key === 'Escape') onClose() }}>
      <div className="panel-heading">
        <div><h3 id="advanced-title">高级搜索</h3><p>按任务条件筛选资源消耗明细列表</p></div>
        <button type="button" className="icon-button close-button" onClick={onClose} aria-label="关闭高级搜索">×</button>
      </div>

      {premium ? (
        <div className="field">
          <label className="field-label" htmlFor="task-name">任务名称</label>
          <input id="task-name" type="text" maxLength={21} placeholder="请输入任务名称" value={draft.taskName} onChange={(event) => set('taskName', event.target.value)} />
        </div>
      ) : <div className="upgrade-note">提示：认证企业后可解锁更多高级搜索，如：任务名称、操作人、操作空间、求解资源类型</div>}

      <MultiSelect label="任务模块" options={moduleOptions.map((value) => ({ value, label: value }))} selected={draft.modules} onChange={(value) => set('modules', value)} {...select('modules')} />

      {premium && <>
        <MultiSelect label="操作人" options={users} selected={draft.users} onChange={(value) => set('users', value)} {...select('users')} />
        <MultiSelect label="操作空间" options={spaces} selected={draft.spaces} onChange={(value) => set('spaces', value)} {...select('spaces')} />
        <MultiSelect label="求解资源类型" options={resources} selected={draft.resourceTypes} onChange={(value) => set('resourceTypes', value as ResourceType[])} {...select('resourceTypes')} />
      </>}

      <MultiSelect label="状态" options={statuses.map((value) => ({ value, label: value }))} selected={draft.status} onChange={(value) => set('status', value as TaskStatus[])} {...select('status')} />

      <fieldset className="date-field">
        <legend className="field-label">时间（按任务起始日期）</legend>
        <div className="date-range">
          <label><span>起始日期</span><input type="date" aria-label="起始日期" value={draft.startDate} onChange={(event) => set('startDate', event.target.value)} /></label>
          <span aria-hidden="true" className="date-divider">至</span>
          <label><span>结束日期</span><input type="date" aria-label="结束日期" value={draft.endDate} onChange={(event) => set('endDate', event.target.value)} /></label>
        </div>
        {error && <p className="field-error" role="alert">{error}</p>}
      </fieldset>

      <div className="panel-actions">
        <button type="button" className="button button-light" onClick={onReset}>重置</button>
        <button type="button" className="button button-primary" onClick={onApply}>应用筛选</button>
      </div>
    </section>
  )
}
