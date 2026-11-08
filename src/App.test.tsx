import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('资源消耗明细页面', () => {
  // Catches a panel that cannot apply a draft filter or fails to sync the applied chip and table.
  it('搜索后显示筛选标签，清除标签同步恢复表格', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: '高级搜索' }))
    await user.type(screen.getByLabelText('任务名称'), '网格')
    await user.click(screen.getByRole('button', { name: '应用筛选' }))
    expect(screen.getByRole('button', { name: '清除任务名称筛选' })).toBeInTheDocument()
    expect(screen.getByText('网格生成')).toBeInTheDocument()
    expect(screen.queryByText('结构求解')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '清除任务名称筛选' }))
    expect(screen.getAllByText('结构求解').length).toBeGreaterThan(0)
  })

  // Catches a search input that accepts more than the documented 21 characters.
  it('项目和任务名称输入限制为 21 个字符', async () => {
    const user = userEvent.setup()
    render(<App />)
    const project = screen.getByRole('searchbox', { name: '搜索项目名称' })
    expect(project).toHaveAttribute('maxLength', '21')
    await user.click(screen.getByRole('button', { name: '高级搜索' }))
    expect(screen.getByLabelText('任务名称')).toHaveAttribute('maxLength', '21')
  })

  // Catches application of an impossible date interval.
  it('日期倒置时保留面板并提示修正', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: '高级搜索' }))
    await user.type(screen.getByLabelText('起始日期'), '2026-11-03')
    await user.type(screen.getByLabelText('结束日期'), '2026-11-01')
    await user.click(screen.getByRole('button', { name: '应用筛选' }))
    expect(screen.getByRole('alert')).toHaveTextContent('结束日期不能早于起始日期')
    expect(screen.getByRole('heading', { name: '高级搜索' })).toBeInTheDocument()
  })

  it('未认证企业只显示基础筛选，私有化环境可筛选 GPU', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: '未认证企业' }))
    await user.click(screen.getByRole('button', { name: '高级搜索' }))
    expect(screen.queryByLabelText('任务名称')).not.toBeInTheDocument()
    expect(screen.getByText(/认证企业后可使用任务名称/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '选择求解资源类型' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '私有化' }))
    await user.click(screen.getByRole('button', { name: '高级搜索' }))
    await user.click(screen.getByRole('button', { name: '选择求解资源类型' }))
    expect(screen.getByRole('checkbox', { name: 'GPU' })).toBeInTheDocument()
  })

  it('多选筛选合并为一条标签，重置后恢复全部记录', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: '高级搜索' }))
    await user.click(screen.getByRole('button', { name: '选择任务模块' }))
    await user.click(screen.getByRole('checkbox', { name: '几何' }))
    await user.click(screen.getByRole('checkbox', { name: '力学' }))
    await user.click(screen.getByRole('button', { name: '应用筛选' }))
    expect(screen.getByText('任务模块：几何 等 2 项')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '高级搜索' }))
    await user.click(screen.getByRole('button', { name: '重置' }))
    await user.click(screen.getByRole('button', { name: '应用筛选' }))
    expect(screen.queryByRole('button', { name: '清除任务模块筛选' })).not.toBeInTheDocument()
    expect(screen.getByText('共 6 条任务')).toBeInTheDocument()
  })

  it('项目搜索历史可再次应用，并有无结果状态', async () => {
    const user = userEvent.setup()
    render(<App />)
    const project = screen.getByRole('searchbox', { name: '搜索项目名称' })
    await user.type(project, '示例项目 B')
    await user.click(screen.getByRole('button', { name: '搜索项目' }))
    expect(screen.getByText('共 2 条任务')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '清除项目名称筛选' }))
    await user.click(project)
    await user.click(screen.getByRole('button', { name: '示例项目 B' }))
    expect(screen.getByText('共 2 条任务')).toBeInTheDocument()
    await user.clear(project)
    await user.type(project, '不存在的项目')
    await user.click(screen.getByRole('button', { name: '搜索项目' }))
    expect(screen.getByRole('status')).toHaveTextContent('没有找到符合条件的记录')
  })

  it('分组开关切换项目分组与逐条任务展示', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('button', { name: /示例项目 A.*2 条任务/ })).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: '分组展示' }))
    expect(screen.queryByRole('button', { name: /示例项目 A.*2 条任务/ })).not.toBeInTheDocument()
    expect(screen.getAllByText('示例项目 A')).toHaveLength(2)
  })

  // Catches option lists that stay stale after the table is narrowed to one project.
  it('操作人下拉选项随已应用的表格范围更新', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByRole('searchbox', { name: '搜索项目名称' }), '示例项目 B')
    await user.click(screen.getByRole('button', { name: '搜索项目' }))
    await user.click(screen.getByRole('button', { name: '高级搜索' }))
    await user.click(screen.getByRole('button', { name: '选择操作人' }))
    expect(screen.getByRole('checkbox', { name: '成员甲' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '成员丙' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: '成员丁' })).not.toBeInTheDocument()
  })
})
