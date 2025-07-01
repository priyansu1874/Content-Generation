
import * as React from "react"
import { cn } from "@/lib/utils"

interface Heading4Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const Heading4 = React.forwardRef<HTMLHeadingElement, Heading4Props>(
  ({ className, children, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn("scroll-m-20 text-xl font-semibold tracking-tight", className)}
      {...props}
    >
      {children}
    </h4>
  )
)
Heading4.displayName = "Heading4"

export { Heading4 }
