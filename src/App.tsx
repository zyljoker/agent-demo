import { useMemo, useRef, useState } from 'react'
import AdvancedSearch from './AdvancedSearch'
import { sampleTasks } from './data'
import { emptyFilters, filterTasks, groupTasks, totalCoreHours, type Filters, type Mode, type Task } from './filtering'

type ChipKey = 'project' | 'taskName' | 'modules' | 'users' | 'spaces' | 'resourceTypes' | 'status' | 'dates'
type Chip = { key: ChipKey; label: string; value: string }

const modes: { value: Mode; label: string }[] = [
  { value: 'certified', label: '认证企业' },
  { value: 'uncertified', label: '未认证企业' },
  { value: 'private', label: '私有化' },
]

function chipsFor(filters: Filters): Chip[] {
  const chips: Chip[] = []
  const add = (key: ChipKey, label: string, value: string) => { if (value) chips.push({ key, label, value }) }
  const multi = (values: string[]) => values.length > 1 ? `${values[0]} 等 ${values.length} 项` : values[0] || ''
  add('project', '项目名称', filters.project)
  add('taskName', '任务名称', filters.taskName)
  add('modules', '任务模块', multi(filters.modules))
  add('users', '操作人', multi(filters.users))
  add('spaces', '操作空间', multi(filters.spaces))
  add('resourceTypes', '求解资源类型', multi(filters.resourceTypes))
  add('status', '状态', filters.status)
  if (filters.startDate || filters.endDate) add('dates', '时间', `${filters.startDate || '不限'} 至 ${filters.endDate || '不限'}`)
  return chips
}

const formatTime = (value: string) => value.replace('T', ' ').slice(0, 16)
const formatHours = (value: number) => Number(value.toFixed(4)).toString()

export default function App() {
  const [mode, setMode] = useState<Mode>('certified')
  const [draft, setDraft] = useState<Filters>(emptyFilters)
  const [applied, setApplied] = useState<Filters>(emptyFilters)
  const [projectInput, setProjectInput] = useState('')
  const [open, setOpen] = useState(false)
  const [dateError, setDateError] = useState('')
  const [grouped, setGrouped] = useState(true)
  const [collapsed, setCollapsed] = useState<string[]>([])
  const [toast, setToast] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const advancedButton = useRef<HTMLButtonElement>(null)

  const availableTasks = useMemo(() => filterTasks(sampleTasks, { ...applied, users: [], spaces: [], resourceTypes: [] }, mode), [applied, mode])
  const results = useMemo(() => filterTasks(sampleTasks, applied, mode), [applied, mode])
  const groups = useMemo(() => groupTasks(results), [results])
  const sortedRows = useMemo(() => [...results].sort((a, b) => b.startedAt.localeCompare(a.startedAt)), [results])
  const activeChips = chipsFor(applied)

  function changeMode(nextMode: Mode) {
    setMode(nextMode)
    setDraft(emptyFilters())
    setApplied(emptyFilters())
    setProjectInput('')
    setOpen(false)
    setDateError('')
    setCollapsed([])
    setShowHistory(false)
  }

  function searchProject(value = projectInput) {
    const project = value.trim()
    setProjectInput(project)
    setApplied((current) => ({ ...current, project }))
    setDraft((current) => ({ ...current, project }))
    if (project) setHistory((current) => [project, ...current.filter((item) => item !== project)].slice(0, 5))
    setShowHistory(false)
    setOpen(false)
  }

  function applyAdvanced() {
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) {
      setDateError('结束日期不能早于起始日期')
      return
    }
    setDateError('')
    setApplied({ ...draft, project: projectInput.trim() })
    setOpen(false)
    advancedButton.current?.focus()
  }

  function clearChip(key: ChipKey) {
    const clear = (filters: Filters): Filters => key === 'dates'
      ? { ...filters, startDate: '', endDate: '' }
      : { ...filters, [key]: emptyFilters()[key] }
    setApplied(clear)
    setDraft(clear)
    if (key === 'project') setProjectInput('')
    setDateError('')
  }

  function resetAll() {
    setDraft(emptyFilters())
    setApplied(emptyFilters())
    setProjectInput('')
  }

  function showPath(task: Task) {
    setToast(task.path.startsWith('其他空间') ? '请切换至该空间后再打开' : `示例数据无法打开项目。路径：${task.path}`)
  }

  function taskRow(task: Task, inGroup: boolean) {
    return <tr key={task.id} className="task-row">
      <td>{inGroup ? <span className="muted">—</span> : <span className="project-cell">{task.projectName}<button type="button" className="path-button" title={task.path} aria-label={`查看${task.projectName}路径`} onClick={() => showPath(task)}>↗</button></span>}</td>
      <td className="task-name">{task.taskName}</td>
      <td>{task.module}</td>
      <td>{task.space}{task.space === '已解散空间' && <span className="small-tag">已解散</span>}</td>
      <td>{task.user}{mode !== 'private' && <span className={`person-tag ${task.userKind}`}>{task.userKind === 'internal' ? '内部' : '外部'}</span>}</td>
      <td className="tabular">{formatTime(task.startedAt)}</td>
      <td className="tabular">{formatTime(task.endedAt)}</td>
      <td>{task.duration}</td>
      <td><span className="resource-type">{task.resourceType}</span></td>
      <td className="numeric">{task.cpuCores}</td>
      <td className="numeric strong">{formatHours(task.coreHours)}</td>
      <td><span className={`status status-${task.status}`} title={task.status === '异常' ? '示例异常：请进入项目查看详情' : undefined}>{task.status}</span></td>
    </tr>
  }

  return <div className="app-shell">
    <aside className="sidebar" aria-label="主导航">
      <div className="brand"><span className="brand-mark">◈</span><span>资源管理</span></div>
      <div className="sidebar-section">工作台</div>
      <nav><a href="#overview">总览</a><a href="#details" className="nav-active" aria-current="page">资源明细</a></nav>
      <div className="sidebar-bottom">组件演示 · 示例数据</div>
    </aside>

    <div className="main-column">
      <header className="topbar"><span>云资源 / 资源明细</span><span className="demo-label">交互演示</span></header>
      <main className="page" id="overview">
        <div className="page-heading"><div><p className="eyebrow">资源使用记录</p><h1>资源消耗明细</h1><p className="page-subtitle">按项目和任务条件查看核时数消耗，快速定位需要核对的记录。</p></div><span className="sample-badge">示例数据</span></div>
        <div className="demo-modes" role="group" aria-label="示例环境"><span>示例环境</span>{modes.map((item) => <button key={item.value} type="button" aria-pressed={mode === item.value} onClick={() => changeMode(item.value)}>{item.label}</button>)}</div>
        <section className="summary-grid" aria-label="示例数据汇总">
          <div className="summary-card"><span className="summary-icon">▦</span><div><span>匹配任务</span><strong>{results.length}<small> 条</small></strong></div></div>
          <div className="summary-card summary-accent"><span className="summary-icon">◷</span><div><span>核时数消耗</span><strong>{totalCoreHours(results)}<small> 核时</small></strong></div></div>
        </section>
        <section className="details-card" id="details" aria-labelledby="details-title" aria-label="资源消耗明细，示例数据">
          <div className="details-header"><div><h2 id="details-title">资源消耗明细</h2><p>筛选结果会同步更新表格与核时数汇总</p></div><span className="results-count">共 {results.length} 条任务</span></div>
          <div className="toolbar">
            <div className="search-area">
              <form className="project-search" role="search" onSubmit={(event) => { event.preventDefault(); searchProject() }}>
                <label className="sr-only" htmlFor="project-search">搜索项目名称</label><span className="search-glyph" aria-hidden="true">⌕</span>
                <input id="project-search" type="search" maxLength={21} placeholder="搜索项目名称" value={projectInput} onChange={(event) => setProjectInput(event.target.value)} onFocus={() => setShowHistory(true)} onBlur={() => setShowHistory(false)} />
                <button type="submit" className="search-submit">搜索项目</button>
              </form>
              {showHistory && history.length > 0 && <div className="history-menu"><span>最近搜索</span>{history.map((item) => <button key={item} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => searchProject(item)}>{item}</button>)}</div>}
              <button ref={advancedButton} type="button" className={`advanced-trigger ${open ? 'trigger-active' : ''}`} aria-label="高级搜索" aria-controls="advanced-search-panel" aria-expanded={open} title="高级搜索" onClick={() => { setOpen(!open); setDateError('') }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18l-7 8v5l-4 2v-7L3 5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M17 17h5M19.5 14.5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></button>
              {open && <div id="advanced-search-panel" className="panel-anchor"><AdvancedSearch mode={mode} draft={draft} availableTasks={availableTasks} error={dateError} onChange={(next) => { setDraft(next); setDateError('') }} onApply={applyAdvanced} onReset={() => { setDraft({ ...emptyFilters(), project: projectInput }); setDateError('') }} onClose={() => { setOpen(false); advancedButton.current?.focus() }} /></div>}
            </div>
            <label className="group-toggle"><input type="checkbox" checked={grouped} onChange={(event) => setGrouped(event.target.checked)} /><span className="toggle-track" aria-hidden="true" /><span>分组展示</span></label>
          </div>
          {activeChips.length > 0 && <div className="chip-row" aria-label="已应用的筛选条件">{activeChips.map((chip) => <span className="filter-chip" key={chip.key}><span>{chip.label}：{chip.value}</span><button type="button" aria-label={`清除${chip.label}筛选`} onClick={() => clearChip(chip.key)}>×</button></span>)}<button type="button" className="clear-all" onClick={resetAll}>清除全部</button></div>}
          {results.length === 0 ? <div className="empty-state" role="status"><span aria-hidden="true">⌕</span><h3>没有找到符合条件的记录</h3><p>请调整搜索词或筛选条件后重试。</p><button type="button" className="button button-light" onClick={resetAll}>清除筛选</button></div> : <><p className="table-scroll-hint">左右滑动表格可查看全部列</p><div className="table-scroll"><table><thead><tr><th scope="col">项目名称</th><th scope="col">任务名称</th><th scope="col">任务模块</th><th scope="col">资源使用</th><th scope="col">用户</th><th scope="col">起始时间</th><th scope="col">结束时间</th><th scope="col">运行时长</th><th scope="col">资源类型</th><th scope="col">CPU 核数</th><th scope="col">核时数（核时）</th><th scope="col">状态</th></tr></thead><tbody>
            {grouped ? groups.flatMap((group) => {
              const isExpanded = !collapsed.includes(group.projectId)
              const first = group.tasks[0]
              return [<tr key={group.projectId} className="group-row"><th scope="rowgroup" colSpan={12}><button type="button" aria-expanded={isExpanded} onClick={() => setCollapsed((current) => isExpanded ? [...current, group.projectId] : current.filter((id) => id !== group.projectId))}><span className="row-chevron">{isExpanded ? '⌄' : '›'}</span>{group.projectName}<span className="group-count">{group.tasks.length} 条任务</span></button><button type="button" className="path-button group-path" title={first.path} aria-label={`查看${group.projectName}路径`} onClick={() => showPath(first)}>↗</button></th></tr>, ...(isExpanded ? group.tasks.map((task) => taskRow(task, true)) : [])]
            }) : sortedRows.map((task) => taskRow(task, false))}
          </tbody></table></div></>}
          <div className="table-footer"><span>时间筛选按任务起始日期计算</span><span>核时数最多展示 4 位小数</span></div>
        </section>
      </main>
    </div>
    {toast && <div className="toast" role="status">{toast}<button type="button" aria-label="关闭提示" onClick={() => setToast('')}>×</button></div>}
  </div>
}
