"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Calendar, Clock, MapPin, ArrowRight, Sparkles } from "lucide-react"
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
      initial={shouldAnimate ? { opacity: 0, y: 20, scale: 0.95 } : undefined}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.3 }}
      className={cn(
        "relative w-full max-w-sm rounded-3xl overflow-hidden group/card",
        "bg-[#FFA400]/[0.04] backdrop-blur-3xl",
        "border border-[#FFA400]/[0.12]",
        "shadow-[0_8px_32px_rgba(255,164,0,0.08),inset_0_1px_0_rgba(255,164,0,0.08)]",
        className
      )}
    >
      {/* Glass shine effect — amber tint */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFA400]/[0.06] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFA400]/[0.2] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFA400]/[0.06] to-transparent" />

      {/* Inner glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#FFA400]/[0.08] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#FFA400]/[0.04] blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative px-6 pt-6 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#008755] animate-pulse" />
            <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#008755]">
              Ceremonia
            </span>
          </div>
          {timeLeft > 0 && (
            <span className="bg-[#FFA400]/10 backdrop-blur-sm text-[#FFA400] px-3 py-1 rounded-full text-[8px] font-bold tracking-wider uppercase border border-[#FFA400]/20">
              <Sparkles className="w-2.5 h-2.5 inline mr-1" />
              Pronto
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-4 text-[11px] text-white/35">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-white/20" />
              <span>29 Abril 2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-white/20" />
              <span>5:00 PM</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/25">
            <MapPin className="w-3.5 h-3.5 text-white/15" />
            <span>Universidad de Monterrey</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-gradient-to-r from-transparent via-[#FFA400]/[0.12] to-transparent" />

      {/* Countdown */}
      {timeLeft > 0 && (
        <div className="relative px-6 py-5">
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { value: days, label: "Días" },
              { value: hours, label: "Hrs" },
              { value: minutes, label: "Min" },
              { value: seconds, label: "Seg" },
            ].map((unit, index) => (
              <motion.div
                key={unit.label}
                variants={index === 3 ? numberVariants : undefined}
                initial="initial"
                animate={index === 3 ? "pulse" : "initial"}
                className={cn(
                  "relative rounded-2xl py-3 text-center overflow-hidden",
                  "bg-[#FFA400]/[0.03] backdrop-blur-sm",
                  "border border-[#FFA400]/[0.08]",
                  "shadow-[inset_0_1px_0_rgba(255,164,0,0.04)]",
                  index === 3 && "border-[#FFA400]/[0.15] bg-[#FFA400]/[0.06]"
                )}
              >
                {/* Inner shine */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#FFA400]/[0.03] to-transparent pointer-events-none" />
                <div className="relative">
                  <div className={cn(
                    "text-2xl font-black tabular-nums font-mono",
                    index === 3 ? "text-[#FFA400]/80" : "text-white/80"
                  )}>
                    {String(unit.value).padStart(2, "0")}
                  </div>
                  <div className="text-[7px] font-semibold text-white/20 uppercase tracking-[0.2em] mt-0.5">
                    {unit.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Separator dots */}
          <div className="absolute top-1/2 left-[27.5%] -translate-y-1/2 flex flex-col gap-1">
            <div className="w-1 h-1 rounded-full bg-[#FFA400]/20" />
            <div className="w-1 h-1 rounded-full bg-[#FFA400]/20" />
          </div>
          <div className="absolute top-1/2 left-[52%] -translate-y-1/2 flex flex-col gap-1">
            <div className="w-1 h-1 rounded-full bg-[#FFA400]/20" />
            <div className="w-1 h-1 rounded-full bg-[#FFA400]/20" />
          </div>
          <div className="absolute top-1/2 left-[76.5%] -translate-y-1/2 flex flex-col gap-1">
            <div className="w-1 h-1 rounded-full bg-[#FFA400]/15" />
            <div className="w-1 h-1 rounded-full bg-[#FFA400]/15" />
          </div>
        </div>
      )}

      {/* Button */}
      <div className="px-6 pb-6">
        <motion.button
          onClick={onGetTicket}
          whileHover={shouldAnimate ? { scale: 1.02, y: -1 } : undefined}
          whileTap={shouldAnimate ? { scale: 0.97 } : undefined}
          className={cn(
            "w-full h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5",
            "bg-gradient-to-r from-[#7C6992] to-[#9580ad] text-white",
            "shadow-[0_4px_16px_rgba(124,106,146,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]",
            "hover:shadow-[0_6px_24px_rgba(124,106,146,0.45),inset_0_1px_0_rgba(255,255,255,0.15)]",
            "transition-shadow duration-300"
          )}
        >
          {timeLeft > 0 ? "Separa tu entrada" : "Entrar al evento"}
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}
