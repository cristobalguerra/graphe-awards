"use client"
import React, { useState } from "react"

interface MenuItemProps {
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  icon?: React.ReactNode
  label?: string
  isActive?: boolean
}

export function MenuItem({ children, onClick, disabled = false, icon, label, isActive = false }: MenuItemProps) {
  return (
    <button
      className={`relative block w-full h-12 text-center group
        ${disabled ? "text-white/30 cursor-not-allowed" : "text-white/70"}
        ${isActive ? "bg-white/10" : ""}
      `}
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="flex items-center justify-center h-full">
        {icon && (
          <span className="h-5 w-5 transition-all duration-200 group-hover:[&_svg]:stroke-[2.5]">
            {icon}
          </span>
        )}
        {children}
      </span>
    </button>
  )
}

export function MenuContainer({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const childrenArray = React.Children.toArray(children)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  // Extract labels from MenuItem children
  const getLabel = (child: React.ReactNode): string | undefined => {
    if (React.isValidElement(child) && (child.props as Record<string, unknown>).label) {
      return (child.props as Record<string, unknown>).label as string
    }
    return undefined
  }

  return (
    <div className="relative" data-expanded={isExpanded}>
      <div className="relative flex flex-col items-end">
        {/* First item - always visible (hamburger/close) */}
        <div
          className="relative w-12 h-12 bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] cursor-pointer rounded-full group will-change-transform z-50 hover:border-white/[0.25] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]"
          onClick={handleToggle}
        >
          {childrenArray[0]}
        </div>
        {/* Other items — circle + label outside */}
        {childrenArray.slice(1).map((child, index) => {
          const label = getLabel(child)
          return (
            <div
              key={index}
              className="absolute top-0 right-0 flex items-center gap-3 will-change-transform"
              style={{
                transform: `translateY(${isExpanded ? (index + 1) * 52 : 0}px)`,
                opacity: isExpanded ? 1 : 0,
                zIndex: 40 - index,
                transition: `transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${isExpanded ? 300 + index * 50 : 200}ms`,
                backfaceVisibility: 'hidden',
                pointerEvents: isExpanded ? 'auto' : 'none',
              }}
            >
              {/* Label outside circle */}
              {label && (
                <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/40 whitespace-nowrap">
                  {label}
                </span>
              )}
              {/* Circle with icon */}
              <div className="w-12 h-12 bg-white/[0.05] backdrop-blur-2xl border border-white/[0.08] rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-white/[0.2] hover:bg-white/[0.08] transition-all duration-300 flex-shrink-0">
                {child}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
