import type { Task } from './filtering'

// Fictional records used only by this standalone interaction demo.
export const sampleTasks: Task[] = [
  { id: 't-01', projectId: 'p-a', projectName: '示例项目 A', taskName: '网格生成', module: '几何', user: '成员甲', userKind: 'internal', space: '研发空间', resourceType: 'CPU', status: '已完成', startedAt: '2026-11-08T09:20:00', endedAt: '2026-11-08T09:58:00', duration: '38 分钟', cpuCores: 16, coreHours: 1.12563, path: '示例空间 / 示例项目 A' },
  { id: 't-02', projectId: 'p-a', projectName: '示例项目 A', taskName: '结构求解', module: '力学', user: '成员乙', userKind: 'external', space: '研发空间', resourceType: 'CPU', status: '已取消', startedAt: '2026-11-07T14:10:00', endedAt: '2026-11-07T15:40:00', duration: '1 小时 30 分钟', cpuCores: 32, coreHours: 2.37542, path: '示例空间 / 示例项目 A' },
  { id: 't-03', projectId: 'p-b', projectName: '示例项目 B', taskName: '热分析', module: '热学', user: '成员丙', userKind: 'internal', space: '项目空间', resourceType: 'CPU', status: '已完成', startedAt: '2026-11-06T11:05:00', endedAt: '2026-11-06T12:05:00', duration: '1 小时', cpuCores: 8, coreHours: 4.12504, path: '示例空间 / 示例项目 B' },
  { id: 't-04', projectId: 'p-c', projectName: '示例项目 C', taskName: 'NURBS 曲面处理', module: 'NURBS曲面', user: '成员乙', userKind: 'external', space: '已解散空间', resourceType: 'GPU', status: '异常', startedAt: '2026-11-05T16:30:00', endedAt: '2026-11-05T16:42:00', duration: '12 分钟', cpuCores: 0, coreHours: 3.25004, path: '其他空间 / 示例项目 C' },
  { id: 't-05', projectId: 'p-b', projectName: '示例项目 B', taskName: '接触识别', module: '识别接触', user: '成员甲', userKind: 'internal', space: '项目空间', resourceType: 'CPU', status: '异常', startedAt: '2026-11-04T09:00:00', endedAt: '2026-11-04T09:15:00', duration: '15 分钟', cpuCores: 8, coreHours: 0.37512, path: '示例空间 / 示例项目 B' },
  { id: 't-06', projectId: 'p-d', projectName: '示例项目 D', taskName: '优化迭代', module: '优化设计', user: '成员丁', userKind: 'external', space: '协作空间', resourceType: 'CPU', status: '已完成', startedAt: '2026-11-03T08:40:00', endedAt: '2026-11-03T10:20:00', duration: '1 小时 40 分钟', cpuCores: 24, coreHours: 1.99872, path: '示例空间 / 示例项目 D' },
  { id: 't-07', projectId: 'p-e', projectName: '示例项目 E', taskName: '载荷导入', module: '导入载荷', user: '成员丙', userKind: 'internal', space: '研发空间', resourceType: 'CPU', status: '已取消', startedAt: '2026-11-02T13:00:00', endedAt: '2026-11-02T13:05:00', duration: '5 分钟', cpuCores: 4, coreHours: 0.05234, path: '示例空间 / 示例项目 E' },
  { id: 't-08', projectId: 'p-f', projectName: '示例项目 F', taskName: '超材料求解', module: '超材料设计', user: '成员戊', userKind: 'internal', space: '协作空间', resourceType: 'GPU', status: '已完成', startedAt: '2026-11-01T17:10:00', endedAt: '2026-11-01T18:10:00', duration: '1 小时', cpuCores: 0, coreHours: 6.02001, path: '其他空间 / 示例项目 F' },
]

export const moduleOptions = ['几何', '识别接触', '导入载荷', '力学', '热学', '优化设计', '超材料设计', 'NURBS曲面']
