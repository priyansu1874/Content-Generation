
import * as React from "react"
import { cn } from "@/lib/utils"

interface Heading3Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const Heading3 = React.forwardRef<HTMLHeadingElement, Heading3Props>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("scroll-m-20 text-2xl font-semibold tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  )
)
Heading3.displayName = "Heading3"

export { Heading3 }
