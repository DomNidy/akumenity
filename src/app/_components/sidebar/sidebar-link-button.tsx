// Renders out a button with a link to a specific page

import Link from "next/link";
import { cn } from "~/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function SidebarLinkButton({
  href,
  label,
  children,
  className,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={50}>
        <TooltipTrigger>
          <Link
            href={href}
            className={cn(
              "z-50 my-1 flex flex-row items-center justify-between gap-2 rounded-lg border border-none border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground",
              className,
            )}
          >
            {children}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
