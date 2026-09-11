import {
  useState, useId, forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react'
import { motion } from 'framer-motion'

/* ─── Text Input ─────────────────────────────────────────────────────────── */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:       string
  error?:       string
  hint?:        string
  iconLeft?:    ReactNode
  iconRight?:   ReactNode
  success?:     boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, iconLeft, iconRight, success = false, className = '', id: idProp, ...rest },
  ref
) {
  const uid      = useId()
  const inputId  = idProp ?? uid
  const [focused, setFocused] = useState(false)

  const borderColor = error
    ? 'rgba(239,68,68,0.60)'
    : success
      ? 'rgba(52,211,153,0.50)'
      : focused
        ? 'rgba(139,92,246,0.70)'
        : 'rgba(255,255,255,0.08)'

  const glow = error
    ? '0 0 0 3px rgba(239,68,68,0.12)'
    : success
      ? '0 0 0 3px rgba(52,211,153,0.12)'
      : focused
        ? '0 0 0 3px rgba(139,92,246,0.14)'
        : 'none'

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {iconLeft && (
          <span className="absolute left-3.5 text-text-muted pointer-events-none"
                aria-hidden="true">
            {iconLeft}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e) }}
          onBlur={(e)  => { setFocused(false); rest.onBlur?.(e) }}
          className={`
            w-full h-10 rounded-xl text-sm text-text-primary
            placeholder:text-text-disabled
            transition-all duration-200
            outline-none appearance-none
            ${iconLeft  ? 'pl-10'  : 'pl-4'}
            ${iconRight ? 'pr-10' : 'pr-4'}
          `}
          style={{
            background:  '#0C1017',
            border:      `1px solid ${borderColor}`,
            boxShadow:   glow,
            caretColor:  '#8B5CF6',
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...rest}
        />

        {iconRight && (
          <span className="absolute right-3.5 text-text-muted pointer-events-none"
                aria-hidden="true">
            {iconRight}
          </span>
        )}
      </div>

      {error && (
        <motion.p
          id={`${inputId}-error`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400 flex items-center gap-1.5"
          role="alert"
        >
          <span aria-hidden="true">⚠</span>
          {error}
        </motion.p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-text-muted">
          {hint}
        </p>
      )}
    </div>
  )
})

/* ─── Textarea ───────────────────────────────────────────────────────────── */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:    string
  error?:    string
  hint?:     string
  maxChars?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, maxChars, className = '', id: idProp, value, defaultValue, ...rest },
  ref
) {
  const uid     = useId()
  const fieldId = idProp ?? uid
  const [focused,  setFocused] = useState(false)
  const [charCount, setCharCount] = useState(
    String(value ?? defaultValue ?? '').length
  )

  const borderColor = error
    ? 'rgba(239,68,68,0.60)'
    : focused
      ? 'rgba(139,92,246,0.70)'
      : 'rgba(255,255,255,0.08)'

  const glow = error
    ? '0 0 0 3px rgba(239,68,68,0.12)'
    : focused
      ? '0 0 0 3px rgba(139,92,246,0.14)'
      : 'none'

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="flex items-baseline justify-between">
          <label htmlFor={fieldId} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
          {maxChars && (
            <span className={`text-xs ${charCount > maxChars ? 'text-red-400' : 'text-text-muted'}`}>
              {charCount}/{maxChars}
            </span>
          )}
        </div>
      )}

      <textarea
        ref={ref}
        id={fieldId}
        value={value}
        defaultValue={defaultValue}
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e) }}
        onBlur={(e)  => { setFocused(false); rest.onBlur?.(e) }}
        onChange={(e) => {
          setCharCount(e.target.value.length)
          rest.onChange?.(e)
        }}
        className={`
          w-full rounded-xl text-sm text-text-primary px-4 py-3
          placeholder:text-text-disabled resize-y
          transition-all duration-200 outline-none
          min-h-[6rem]
        `}
        style={{
          background:  '#0C1017',
          border:      `1px solid ${borderColor}`,
          boxShadow:   glow,
          caretColor:  '#8B5CF6',
        }}
        aria-invalid={!!error}
        {...rest}
      />

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5" role="alert">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-text-muted">{hint}</p>
      )}
    </div>
  )
})

/* ─── Select ─────────────────────────────────────────────────────────────── */
interface SelectOption { value: string; label: string }

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?:    string
  options:   SelectOption[]
  error?:    string
  hint?:     string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, error, hint, className = '', id: idProp, ...rest },
  ref
) {
  const uid     = useId()
  const fieldId = idProp ?? uid
  const [focused, setFocused] = useState(false)

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full h-10 rounded-xl text-sm text-text-primary px-4 pr-10 appearance-none outline-none cursor-pointer transition-all duration-200"
          style={{
            background:   '#0C1017',
            border:       `1px solid ${focused ? 'rgba(139,92,246,0.70)' : error ? 'rgba(239,68,68,0.60)' : 'rgba(255,255,255,0.08)'}`,
            boxShadow:    focused ? '0 0 0 3px rgba(139,92,246,0.14)' : 'none',
            caretColor:   '#8B5CF6',
          }}
          {...(rest as TextareaHTMLAttributes<HTMLSelectElement>)}
        >
          {options.map(o => (
            <option key={o.value} value={o.value} style={{ background: '#0C1017' }}>
              {o.label}
            </option>
          ))}
        </select>
        {/* Chevron icon */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          <ChevronDown />
        </span>
      </div>
      {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  )
})

/* ─── Search Input ───────────────────────────────────────────────────────── */
interface SearchInputProps extends Omit<InputProps, 'iconLeft' | 'label'> {
  placeholder?: string
}

export function SearchInput({ placeholder = 'Search…', ...rest }: SearchInputProps) {
  return (
    <Input
      type="search"
      placeholder={placeholder}
      iconLeft={<SearchIcon />}
      {...rest}
    />
  )
}

/* ─── Icon primitives ──────────────────────────────────────────────────── */
function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
