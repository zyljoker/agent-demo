import { describe, expect, it } from 'vitest'
import { emptyFilters, filterTasks, formatCoreHours, formatDuration, groupTasks, totalCoreHours, type Task } from './filtering'

const rows: Task[] = [
  { id: 'a1', projectId: 'a', projectName: '示例项目 A', taskName: '网格生成', module: '几何', user: '成员甲', userKind: 'internal', space: '空间一', resourceType: 'CPU', status: '已完成', startedAt: '2026-11-01T09:00:00', endedAt: '2026-11-01T10:00:00', coreHours: 1.23456, cpuCores: 8, duration: '1小时', path: '/项目/A' },
  { id: 'a2', projectId: 'a', projectName: '示例项目 A', taskName: '结构求解', module: '力学', user: '成员乙', userKind: 'external', space: '空间二', resourceType: 'GPU', status: '异常', startedAt: '2026-11-03T09:00:00', endedAt: '2026-11-03T09:30:00', coreHours: 2.00005, cpuCores: 0, duration: '30分钟', path: '/项目/A' },
  { id: 'b1', projectId: 'b', projectName: '示例项目 B', taskName: '结构求解', module: '力学', user: '成员甲', userKind: 'internal', space: '空间一', resourceType: 'CPU', status: '已取消', startedAt: '2026-11-02T09:00:00', endedAt: '2026-11-02T09:15:00', coreHours: 0.12345, cpuCores: 4, duration: '15分钟', path: '/项目/B' },
]

describe('资源消耗筛选', () => {
  // Catches an implementation that applies filters with OR or ignores the start-date boundary.
  it('按项目、任务、模块和起始日期组合筛选，日期边界包含当天', () => {
    const result = filterTasks(rows, { ...emptyFilters(), project: '项目 B', taskName: '结构', modules: ['力学'], startDate: '2026-11-02', endDate: '2026-11-02' }, 'certified')
    expect(result.map((row) => row.id)).toEqual(['b1'])
  })

  // Catches a cloud view that exposes GPU rows or applies premium filters to uncertified enterprises.
  it('云端排除 GPU，未认证模式忽略高级权限字段', () => {
    const filters = { ...emptyFilters(), users: ['成员乙'], resourceTypes: ['GPU' as const], modules: ['力学'] }
    expect(filterTasks(rows, filters, 'uncertified').map((row) => row.id)).toEqual(['b1'])
    expect(filterTasks(rows, filters, 'private').map((row) => row.id)).toEqual(['a2'])
  })

  it('同一字段多选取并集，不同字段取交集', () => {
    const filters = { ...emptyFilters(), modules: ['几何', '力学'], status: ['已完成', '异常'] as Task['status'][] }
    expect(filterTasks(rows, filters, 'private').map((row) => row.id)).toEqual(['a1', 'a2'])
  })

  // Catches grouping by the first task rather than the latest task in each project.
  it('按项目最新任务时间排序，并将组内任务倒序排列', () => {
    expect(groupTasks(rows).map((group) => [group.projectId, group.tasks.map((task) => task.id)])).toEqual([
      ['a', ['a2', 'a1']],
      ['b', ['b1']],
    ])
  })

  // Catches premature rounding of individual rows before calculating the displayed total.
  it('汇总后四舍五入到四位小数', () => {
    expect(totalCoreHours(rows)).toBe('3.3581')
  })

  it('核时数缺失显示斜杠，汇总忽略缺失值', () => {
    const withMissing = { ...rows[0], coreHours: null, cpuCores: null }
    expect(formatCoreHours(withMissing.coreHours)).toBe('/')
    expect(formatCoreHours(1.2)).toBe('1.2000')
    expect(formatCoreHours(0.00015)).toBe('0.0002')
    expect(totalCoreHours([withMissing, rows[1]])).toBe('2.0001')
    expect(totalCoreHours([])).toBe('/')
    expect(totalCoreHours([withMissing])).toBe('/')
  })

  it('按起止时间生成运行时长并省略零单位', () => {
    expect(formatDuration('2026-11-08T09:20:00', '2026-11-08T09:58:00')).toBe('38分钟')
    expect(formatDuration('2026-11-08T09:20:00', '2026-11-08T09:20:48')).toBe('48秒')
    expect(formatDuration('2026-11-08T09:20:00', '2026-11-08T10:21:41')).toBe('1小时1分钟41秒')
  })
})
