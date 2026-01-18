import type { Child } from 'hono/jsx'

interface IconProps {
  name: string
  class?: string
  filled?: boolean
}

export const Icon = ({ name, class: className = '', filled = false }: IconProps) => (
  <span class={`material-symbols-${filled ? 'filled' : 'outlined'} ${className}`}>{name}</span>
)

// Button variants
interface ButtonProps {
  children: Child
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  class?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  onclick?: string
}

const buttonVariants = {
  primary: 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20',
  secondary: 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200',
  ghost: 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-300',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20',
}

const buttonSizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  class: className = '',
  type = 'button',
  disabled = false,
  onclick
}: ButtonProps) => (
  <button 
    type={type}
    disabled={disabled}
    onclick={onclick}
    class={`font-bold rounded-lg transition-all ${buttonVariants[variant]} ${buttonSizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
)

// Input component
interface InputProps {
  type?: 'text' | 'password' | 'number' | 'email'
  value?: string | number
  placeholder?: string
  disabled?: boolean
  class?: string
  id?: string
  name?: string
}

export const Input = ({ 
  type = 'text', 
  value, 
  placeholder, 
  disabled = false,
  class: className = '',
  id,
  name
}: InputProps) => (
  <input 
    type={type}
    value={value}
    placeholder={placeholder}
    disabled={disabled}
    id={id}
    name={name}
    class={`w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${disabled ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : ''} ${className}`}
  />
)

// Toggle switch component
interface ToggleProps {
  checked?: boolean
  id?: string
  name?: string
  onchange?: string
}

export const Toggle = ({ checked = false, id, name, onchange }: ToggleProps) => (
  <div 
    class={`w-12 h-6 ${checked ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'} rounded-full relative cursor-pointer transition-colors`}
    onclick={onchange}
    id={id}
    data-name={name}
  >
    <div class={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${checked ? 'right-1' : 'left-1'}`}></div>
  </div>
)

// Card container
interface CardProps {
  children: Child
  class?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const cardPadding = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export const Card = ({ children, class: className = '', padding = 'md' }: CardProps) => (
  <div class={`bg-background-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ${cardPadding[padding]} ${className}`}>
    {children}
  </div>
)

// Section header for cards
interface SectionHeaderProps {
  icon: string
  title: string
}

export const SectionHeader = ({ icon, title }: SectionHeaderProps) => (
  <div class="flex items-center gap-3 mb-6">
    <Icon name={icon} class="text-sm text-slate-400" />
    <span class="text-xs font-bold text-slate-400 tracking-widest uppercase">{title}</span>
  </div>
)

// Form field wrapper
interface FormFieldProps {
  label: string
  description?: string
  children: Child
  horizontal?: boolean
}

export const FormField = ({ label, description, children, horizontal = false }: FormFieldProps) => (
  <div class={horizontal ? 'flex items-center justify-between' : ''}>
    <div class={horizontal ? '' : 'mb-2'}>
      <label class="block text-sm font-bold text-slate-700 dark:text-slate-200">{label}</label>
      {description && <p class="text-xs text-slate-500 mt-0.5">{description}</p>}
    </div>
    {!horizontal && children}
    {horizontal && <div>{children}</div>}
  </div>
)

// Select dropdown
interface SelectProps {
  options: { value: string; label: string }[]
  value?: string
  class?: string
  id?: string
  name?: string
}

export const Select = ({ options, value, class: className = '', id, name }: SelectProps) => (
  <select 
    id={id}
    name={name}
    class={`bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary ${className}`}
  >
    {options.map(opt => (
      <option value={opt.value} selected={opt.value === value}>{opt.label}</option>
    ))}
  </select>
)

// Badge component
interface BadgeProps {
  children: Child
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
  class?: string
}

const badgeVariants = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-500/10 text-emerald-500',
  warning: 'bg-orange-500/10 text-orange-500',
  danger: 'bg-red-500/10 text-red-500',
  neutral: 'bg-slate-500/10 text-slate-400',
}

export const Badge = ({ children, variant = 'primary', class: className = '' }: BadgeProps) => (
  <span class={`px-2 py-1 text-[10px] font-bold rounded uppercase ${badgeVariants[variant]} ${className}`}>
    {children}
  </span>
)

// Divider
export const Divider = ({ class: className = '' }: { class?: string }) => (
  <div class={`border-t border-slate-100 dark:border-slate-800 ${className}`}></div>
)

// Slider (range) component  
interface SliderProps {
  value: number
  max: number
  color?: 'primary' | 'purple'
  label?: string
  displayValue?: string
  unit?: string
  minLabel?: string
  maxLabel?: string
}

export const Slider = ({ 
  value, 
  max, 
  color = 'primary', 
  label,
  displayValue,
  unit,
  minLabel = 'Unlimited',
  maxLabel
}: SliderProps) => {
  const percent = (value / max) * 100
  const colorClass = color === 'primary' ? 'bg-primary' : 'bg-purple-500'
  const textColorClass = color === 'primary' ? 'text-primary' : 'text-purple-500'
  
  return (
    <div>
      {(label || displayValue) && (
        <div class="flex items-center justify-between mb-4">
          {label && <label class="block text-sm font-bold text-slate-700 dark:text-slate-200">{label}</label>}
          {displayValue && (
            <span class={`${textColorClass} font-bold font-mono`}>
              {displayValue} {unit && <span class="text-xs text-slate-500 font-sans">{unit}</span>}
            </span>
          )}
        </div>
      )}
      <div class="relative h-2 bg-slate-100 dark:bg-slate-700 rounded-full">
        <div class={`absolute left-0 top-0 bottom-0 ${colorClass} rounded-full`} style={`width: ${percent}%`}></div>
        <div 
          class={`absolute top-1/2 -translate-y-1/2 w-4 h-4 ${colorClass} border-2 border-white dark:border-surface-dark rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform`}
          style={`left: ${percent}%`}
        ></div>
      </div>
      <div class="flex justify-between mt-2 text-xs text-slate-500">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  )
}
