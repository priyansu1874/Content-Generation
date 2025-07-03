
import * as React from "react"
import { cn } from "@/shared/utils/utils"

interface Heading1Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const Heading1 = React.forwardRef<HTMLHeadingElement, Heading1Props>(
  ({ className, children, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn("scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl", className)}
      {...props}
    >
      {children}
    </h1>
  )
)
Heading1.displayName = "Heading1"

export { Heading1 }
