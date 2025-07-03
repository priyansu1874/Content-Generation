
import * as React from "react"
import { cn } from "@/shared/utils/utils"

interface Heading2Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const Heading2 = React.forwardRef<HTMLHeadingElement, Heading2Props>(
  ({ className, children, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0", className)}
      {...props}
    >
      {children}
    </h2>
  )
)
Heading2.displayName = "Heading2"

export { Heading2 }
