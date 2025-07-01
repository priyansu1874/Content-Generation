
import * as React from "react"
import { cn } from "@/lib/utils"

interface Heading5Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const Heading5 = React.forwardRef<HTMLHeadingElement, Heading5Props>(
  ({ className, children, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("scroll-m-20 text-lg font-semibold tracking-tight", className)}
      {...props}
    >
      {children}
    </h5>
  )
)
Heading5.displayName = "Heading5"

export { Heading5 }
