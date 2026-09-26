import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base: consistent layout, transitions, accessibility
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border font-medium whitespace-nowrap text-sm transition-all duration-150 select-none outline-none cursor-pointer " +
  "focus-visible:ring-3 focus-visible:ring-blue-500/30 focus-visible:outline-none " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "active:not-aria-[haspopup]:translate-y-px " +
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Primary — solid blue, immediately stands out, shadow for depth
        default:
          "border-blue-700/20 bg-blue-600 text-white shadow-sm " +
          "hover:bg-blue-700 active:bg-blue-800 " +
          "dark:bg-blue-600 dark:hover:bg-blue-500",

        // Outline — white background, clearly visible gray border, distinct from primary
        outline:
          "border-gray-300 bg-white text-gray-700 shadow-xs " +
          "hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 " +
          "active:bg-gray-100 " +
          "dark:border-white/20 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10",

        // Secondary — blue-gray tint, clearly different from outline
        secondary:
          "border-blue-200 bg-blue-50 text-blue-700 shadow-xs " +
          "hover:bg-blue-100 hover:border-blue-300 " +
          "active:bg-blue-200 " +
          "dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300",

        // Ghost — no border, no background, for less prominent actions
        ghost:
          "border-transparent bg-transparent text-gray-600 " +
          "hover:bg-gray-100 hover:text-gray-900 " +
          "dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white",

        // Destructive — solid red, unmistakable danger intent
        destructive:
          "border-red-700/20 bg-red-600 text-white shadow-sm " +
          "hover:bg-red-700 active:bg-red-800 " +
          "dark:bg-red-700 dark:hover:bg-red-600",

        // Link — looks like a hyperlink
        link: "border-transparent bg-transparent text-blue-600 underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 rounded px-2 text-xs " +
            "has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 " +
            "[&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded px-2.5 text-[0.8rem] " +
            "has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 " +
            "[&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-5 text-base",
        icon: "size-9",
        "icon-xs": "size-6 rounded [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
