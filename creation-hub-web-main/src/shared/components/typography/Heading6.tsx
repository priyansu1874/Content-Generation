
import * as React from "react"
import { cn } from "@/shared/utils/utils"

interface Heading6Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const Heading6 = React.forwardRef<HTMLHeadingElement, Heading6Props>(
  ({ className, children, ...props }, ref) => (
    <h6
      ref={ref}
      className={cn("scroll-m-20 text-base font-semibold tracking-tight", className)}
      {...props}
    >
      {children}
    </h6>
  )
)
Heading6.displayName = "Heading6"

export { Heading6 }
