import type { Task } from './filtering'

const fallback = '求解异常，详情请进入项目内查看'

const messages: Record<string, string> = {
  stl_not_watertight: 'stl文件不水密',
  stl_non_manifold: 'stl文件非流形',
  stl_self_intersection: '存在三角形自相交，请检查',
  stl_open_failed: '无法打开stl文件，请检查',
  no_contact: '不存在接触，请尝试调整参数',
  multiple_analysis_steps: '必须仅包含一个分析步',
  no_solid_geometry: '所导入的几何体不包含实体文件',
  invalid_json: '解析json文件时发生错误，请检查json文件文本格式',
  invalid_bin: 'bin文件格式错误',
  assembly_contact_limit: '导入装配体接触数目超过当前版本最大值',
  invalid_geometry_count: '识别接触时几何体数量异常',
  contact_pair_lookup_failed: '查找接触对时发生错误，请检查几何文件',
  csv_open_failed: '无法打开csv文件',
  load_import_failed: '计算导入载荷失败',
}

export function getErrorMessage(task: Pick<Task, 'errorType' | 'errorMessage'>): string {
  return task.errorMessage || (task.errorType ? messages[task.errorType] : undefined) || fallback
}
