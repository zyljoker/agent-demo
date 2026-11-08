import { describe, expect, it } from 'vitest'
import { getErrorMessage } from './errorMessages'

describe('异常原因', () => {
  it('按类型展示已知原因，后端文案优先，未知类型使用兜底', () => {
    expect(getErrorMessage({ errorType: 'stl_not_watertight' })).toBe('stl文件不水密')
    expect(getErrorMessage({ errorType: 'no_contact' })).toBe('不存在接触，请尝试调整参数')
    expect(getErrorMessage({ errorType: 'nurbs' })).toBe('求解异常，详情请进入项目内查看')
    expect(getErrorMessage({ errorType: 'no_contact', errorMessage: '具体任务原因' })).toBe('具体任务原因')
  })
})
