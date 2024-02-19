import { X } from "lucide-react";
import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "~/lib/utils";

export const MenuClose = forwardRef<
  SVGSVGElement,
  HTMLAttributes<SVGSVGElement>
>(({ className, ...props }, ref) => {
  return (
    <X
      className={cn(
        className,
        "duration-[25ms] h-4 w-4 cursor-pointer rounded-full transition-colors hover:bg-white/15 hover:saturate-150",
      )}
      ref={ref}
      {...props}
    />
  );
});
