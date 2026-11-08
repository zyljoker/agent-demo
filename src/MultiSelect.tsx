import type { ReactNode } from 'react'

export interface SelectOption {
  value: string
  label: string
  group?: string
}

interface MultiSelectProps {
  label: string
  placeholder?: string
  options: SelectOption[]
  selected: string[]
  open: boolean
  onToggle: () => void
  onChange: (next: string[]) => void
  children?: ReactNode
}

export default function MultiSelect({ label, placeholder = '请选择', options, selected, open, onToggle, onChange, children }: MultiSelectProps) {
  const chosen = options.filter((option) => selected.includes(option.value))
  const summary = chosen.length === 0 ? placeholder : chosen.length === 1 ? chosen[0].label : `${chosen[0].label} 等 ${chosen.length} 项`
  const groups = [...new Set(options.map((option) => option.group || ''))]

  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value])
  }

  function toggleGroup(values: string[]) {
    const allSelected = values.every((value) => selected.includes(value))
    onChange(allSelected ? selected.filter((value) => !values.includes(value)) : [...new Set([...selected, ...values])])
  }

  return (
    <div className="field multi-select">
      <span className="field-label">{label}</span>
      <button type="button" className="select-control" aria-label={`选择${label}`} aria-expanded={open} onClick={onToggle}>
        <span className={chosen.length ? '' : 'placeholder'}>{summary}</span><span aria-hidden="true" className="chevron">⌄</span>
      </button>
      {open && (
        <div className="select-menu" role="group" aria-label={`${label}选项`}>
          <label className="select-option select-all">
            <input type="checkbox" checked={options.length > 0 && options.every((option) => selected.includes(option.value))} onChange={() => toggleGroup(options.map((option) => option.value))} />
            全部
          </label>
          {groups.map((group) => {
            const groupOptions = options.filter((option) => (option.group || '') === group)
            return (
              <div key={group || 'default'}>
                {group && <button type="button" className="select-group" onClick={() => toggleGroup(groupOptions.map((option) => option.value))}>{group}<span>全选</span></button>}
                {groupOptions.map((option) => (
                  <label className="select-option" key={option.value}>
                    <input type="checkbox" checked={selected.includes(option.value)} onChange={() => toggle(option.value)} />
                    {option.label}
                  </label>
                ))}
              </div>
            )
          })}
          {children}
        </div>
      )}
    </div>
  )
}
