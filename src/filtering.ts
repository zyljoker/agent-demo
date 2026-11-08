export type Mode = 'certified' | 'uncertified' | 'private'
export type UserKind = 'internal' | 'external'
export type ResourceType = 'CPU' | 'GPU'
export type TaskStatus = '已完成' | '已取消' | '异常'

export interface Task {
  id: string
  projectId: string
  projectName: string
  taskName: string
  module: string
  user: string
  userKind: UserKind
  space: string
  resourceType: ResourceType
  status: TaskStatus
  startedAt: string
  endedAt: string
  coreHours: number
  cpuCores: number
  duration: string
  path: string
}

export interface Filters {
  project: string
  taskName: string
  modules: string[]
  users: string[]
  spaces: string[]
  resourceTypes: ResourceType[]
  status: TaskStatus | ''
  startDate: string
  endDate: string
}

export interface TaskGroup {
  projectId: string
  projectName: string
  latestStart: string
  tasks: Task[]
}

export const emptyFilters = (): Filters => ({
  project: '',
  taskName: '',
  modules: [],
  users: [],
  spaces: [],
  resourceTypes: [],
  status: '',
  startDate: '',
  endDate: '',
})

export function filterTasks(tasks: Task[], filters: Filters, mode: Mode): Task[] {
  const project = filters.project.trim().toLocaleLowerCase()
  const taskName = filters.taskName.trim().toLocaleLowerCase()
  const hasPremiumFilters = mode !== 'uncertified'

  return tasks.filter((task) => {
    if (mode !== 'private' && task.resourceType === 'GPU') return false
    if (project && !task.projectName.toLocaleLowerCase().includes(project)) return false
    if (filters.modules.length && !filters.modules.includes(task.module)) return false
    if (filters.status && task.status !== filters.status) return false

    const taskDate = task.startedAt.slice(0, 10)
    if (filters.startDate && taskDate < filters.startDate) return false
    if (filters.endDate && taskDate > filters.endDate) return false

    if (!hasPremiumFilters) return true
    if (taskName && !task.taskName.toLocaleLowerCase().includes(taskName)) return false
    if (filters.users.length && !filters.users.includes(task.user)) return false
    if (filters.spaces.length && !filters.spaces.includes(task.space)) return false
    if (filters.resourceTypes.length && !filters.resourceTypes.includes(task.resourceType)) return false
    return true
  })
}

export function groupTasks(tasks: Task[]): TaskGroup[] {
  const groups = new Map<string, TaskGroup>()
  for (const task of tasks) {
    const group = groups.get(task.projectId)
    if (group) {
      group.tasks.push(task)
      if (task.startedAt > group.latestStart) group.latestStart = task.startedAt
    } else {
      groups.set(task.projectId, {
        projectId: task.projectId,
        projectName: task.projectName,
        latestStart: task.startedAt,
        tasks: [task],
      })
    }
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      tasks: group.tasks.sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    }))
    .sort((a, b) => b.latestStart.localeCompare(a.latestStart))
}

export function totalCoreHours(tasks: Task[]): string {
  const total = tasks.reduce((sum, task) => sum + task.coreHours, 0)
  return (Math.round((total + Number.EPSILON) * 10_000) / 10_000).toFixed(4)
}
