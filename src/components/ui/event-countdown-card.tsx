"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import { EVENT_DATE } from "@/lib/data"

interface EventCountdownCardProps {
  onGetTicket?: () => void
  className?: string
}

export function EventCountdownCard({ onGetTicket, className }: EventCountdownCardProps) {
  const [timeLeft, setTimeLeft] = useState(0)
  const shouldReduceMotion = useReducedMotion()
  const shouldAnimate = !shouldReduceMotion

  useEffect(() => {
    const update = () => {
      setTimeLeft(Math.max(0, Math.floor((+EVENT_DATE - Date.now()) / 1000)))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  const days = Math.floor(timeLeft / 86400)
  const hours = Math.floor((timeLeft % 86400) / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)
  const seconds = timeLeft % 60

  const numberVariants = {
    initial: { scale: 1, opacity: 1 },
    pulse: shouldAnimate ? {
      scale: [1, 1.08, 1],
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" as const },
    } : {},
  }

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 20 } : undefined}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={cn("space-y-4", className)}
    >
      {/* Meta info */}
      <div className="flex items-center gap-5 text-[11px] text-white/30 tracking-wide">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#008755] animate-pulse" />
          <span className="uppercase tracking-[0.2em] text-[#008755]/80 font-medium">Ceremonia</span>
        </div>
        <span style={{ color: "#DB6B30" }}>29 Abril 2026</span>
        <span style={{ color: "#7C6992" }}>5:00 PM</span>
        <span style={{ color: "#FFA400" }}>UDEM</span>
      </div>

      {/* Countdown */}
      {timeLeft > 0 && (
        <div className="flex items-end gap-6">
          {[
            { value: days, label: "días", color: "#FFB3AB" },
            { value: hours, label: "hrs", color: "#FFB3AB" },
            { value: minutes, label: "min", color: "#FFB3AB" },
            { value: seconds, label: "seg", color: "#FFB3AB" },
          ].map((unit, index) => (
            <motion.div
              key={unit.label}
              variants={index === 3 ? numberVariants : undefined}
              initial="initial"
              animate={index === 3 ? "pulse" : "initial"}
              className="flex flex-col items-start"
            >
              <span className="text-5xl font-black tabular-nums leading-none" style={{ color: unit.color }}>
                {String(unit.value).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] mt-1" style={{ color: unit.color }}>
                {unit.label}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
