import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle } from 'lucide-react'

export default function SelectMenu({
  value,
  selected,
  selectedId,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  optionClassName = '',
  ariaLabel,
  validationError = null
}) {
  const id = useId()
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [menuStyle, setMenuStyle] = useState(null)

  const isLegacy = useMemo(() => {
    if (selectedId !== undefined) return true
    const first = options?.[0]
    if (!first) return false
    return Object.prototype.hasOwnProperty.call(first, 'id') && !Object.prototype.hasOwnProperty.call(first, 'value')
  }, [options, selectedId])

  const currentValue = isLegacy
    ? (selectedId ?? value ?? selected ?? '')
    : (value ?? selected ?? selectedId ?? '')

  const getOptionValue = (o) => (isLegacy ? o?.id : o?.value)
  const getOptionLabel = (o) => (o?.label ?? String(getOptionValue(o) ?? ''))

  const selectedOption = useMemo(
    () => (options || []).find(o => String(getOptionValue(o)) === String(currentValue)),
    [options, currentValue, isLegacy]
  )

  const close = () => {
    setOpen(false)
    setActiveIndex(-1)
  }

  const openMenu = () => {
    if (disabled) return
    setOpen(true)
  }

  const toggle = () => {
    if (disabled) return
    setOpen(v => !v)
  }

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e) => {
      const btn = buttonRef.current
      const menu = menuRef.current
      if (!btn || !menu) return
      if (btn.contains(e.target) || menu.contains(e.target)) return
      close()
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape') close()
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const btn = buttonRef.current
    if (!btn) return

    const compute = () => {
      const rect = btn.getBoundingClientRect()
      const gap = 8
      const viewportPadding = 12
      const maxWidth = window.innerWidth - viewportPadding * 2
      const width = Math.min(rect.width, maxWidth)
      let left = rect.left
      left = Math.min(Math.max(left, viewportPadding), window.innerWidth - viewportPadding - width)
      const top = rect.bottom + gap
      const maxHeight = Math.max(160, window.innerHeight - viewportPadding - top)
      setMenuStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        maxHeight: `${maxHeight}px`
      })
    }

    compute()
    const onScroll = () => compute()
    const onResize = () => compute()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const selectedIndex = (options || []).findIndex(o => String(getOptionValue(o)) === String(currentValue))
    const nextIndex = selectedIndex >= 0 ? selectedIndex : 0
    setActiveIndex(nextIndex)
  }, [open, options, currentValue, isLegacy])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => menuRef.current?.focus(), 0)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const menu = menuRef.current
    if (!menu) return
    const el = menu.querySelector(`[data-ue-option-index="${activeIndex}"]`)
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex, open])

  const onButtonKeyDown = (e) => {
    if (disabled) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      openMenu()
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle()
    }
  }

  const onMenuKeyDown = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveIndex(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActiveIndex(options.length - 1)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const opt = options[activeIndex]
      if (!opt) return
      onChange?.(isLegacy ? opt : getOptionValue(opt))
      close()
      buttonRef.current?.focus()
    } else if (e.key === 'Tab') {
      close()
    }
  }

  const menu = open && menuStyle ? (
    <div
      ref={menuRef}
      id={`${id}-menu`}
      className={`ue-select-menu ${menuClassName}`}
      style={menuStyle}
      role="listbox"
      tabIndex={-1}
      aria-labelledby={`${id}-button`}
      onKeyDown={onMenuKeyDown}
      data-state={open ? 'open' : 'closed'}
    >
      {options.map((o, idx) => {
        const isSelected = String(getOptionValue(o)) === String(currentValue)
        const isActive = idx === activeIndex
        return (
          <button
            key={String(getOptionValue(o))}
            type="button"
            className={`ue-select-option ${optionClassName} ${isSelected ? 'ue-select-option--selected' : ''} ${isActive ? 'ue-select-option--active' : ''}`}
            role="option"
            aria-selected={isSelected}
            data-ue-option-index={idx}
            onPointerEnter={() => setActiveIndex(idx)}
            onClick={() => {
              onChange?.(isLegacy ? o : getOptionValue(o))
              close()
              buttonRef.current?.focus()
            }}
          >
            {getOptionLabel(o)}
          </button>
        )
      })}
    </div>
  ) : null

  return (
    <div className={className}>
      <button
        id={`${id}-button`}
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        aria-invalid={!!validationError}
        className={`ue-select-button ${buttonClassName} ${disabled ? 'ue-select-button--disabled' : ''} ${validationError ? 'border border-red-500' : ''}`}
        onClick={toggle}
        onKeyDown={onButtonKeyDown}
      >
        <span className="ue-select-value">
          {selectedOption ? getOptionLabel(selectedOption) : placeholder}
        </span>
      </button>
      {validationError && (
        <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
          <AlertCircle size={10} /> {validationError}
        </p>
      )}
      {menu ? createPortal(menu, document.body) : null}
    </div>
  )
}

