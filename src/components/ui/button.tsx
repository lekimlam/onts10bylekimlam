import * as React from "react"
import { motion, HTMLMotionProps } from "motion/react"
import { cn } from "@/src/lib/utils"

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "default" | "outline" | "ghost" | "danger" | "success";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-black transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-indigo-600 text-white shadow-[0_4px_0_#4338ca] active:translate-y-[2px] active:shadow-[0_2px_0_#4338ca]": variant === "default",
            "border-2 border-slate-200 bg-white text-slate-800 shadow-[0_4px_0_#e2e8f0] active:translate-y-[2px] active:shadow-[0_2px_0_#e2e8f0]": variant === "outline",
            "hover:bg-slate-100 text-slate-700 active:bg-slate-200": variant === "ghost",
            "bg-red-500 text-white shadow-[0_4px_0_#dc2626] active:translate-y-[2px] active:shadow-[0_2px_0_#dc2626]": variant === "danger",
            "bg-emerald-500 text-white shadow-[0_4px_0_#059669] active:translate-y-[2px] active:shadow-[0_2px_0_#059669]": variant === "success",
            "h-10 px-4 py-2": size === "default",
            "h-8 rounded-lg px-3 text-xs": size === "sm",
            "h-12 rounded-2xl px-8 text-lg font-black tracking-wide": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
