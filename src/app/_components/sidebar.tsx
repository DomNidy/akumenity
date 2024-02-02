"use client";

import { useEffect, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  BarChart2Icon,
  BookType,
  LayoutDashboard,
  UserRoundIcon,
} from "lucide-react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

export default function Sidebar() {
  const user = useUser();

  return (
    <div className="sticky  left-0 top-0 float-start max-h-screen min-h-screen rounded-lg border ">
      <div className="flex flex-col items-center border-b-[1.5px] bg-blend-color-burn">
        <div className="flex w-full cursor-default flex-col  items-center justify-center gap-2 border border-input bg-background p-2">
          {!user.isLoaded ? <UserRoundIcon /> : <UserButton />}
        </div>
        <div className="flex flex-col">
          <TooltipProvider>
            <Tooltip delayDuration={50}>
              <TooltipTrigger className="self-start">
                {/** TODO: Continue working on sidebar, add the clerk userbutton here */}
                <div className="my-1 flex flex-row items-center justify-between gap-2 rounded-lg border border-none border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground">
                  <Link href="/dashboard">
                    <LayoutDashboard />
                  </Link>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="self-start font-semibold">
                <p>Dashboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip delayDuration={50}>
              <TooltipTrigger className="w-full self-start">
                <div className="my-1 flex flex-row items-center justify-between gap-2 rounded-lg border border-none border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground">
                  <Link href="/dashboard/my-topics">
                    <BookType />
                  </Link>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Topics</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip delayDuration={50}>
              <TooltipTrigger className="w-full self-start">
                <div className="my-1 flex flex-row items-center justify-between gap-2 rounded-lg border border-none border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground">
                  <Link href="/dashboard">
                    <BarChart2Icon />
                  </Link>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-semibold ">Activity</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
