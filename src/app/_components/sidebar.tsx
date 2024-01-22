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

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [screenWidth, setScreenWidth] = useState(0);

  // The minimum size the sidebar should be (does not apply when collapsed)
  const [minSize, setMinSize] = useState(10);
  const [sidebarCurrentSize, setSidebarCurrentSize] = useState(10);
  const [collapsedSize, setCollapsedSize] = useState(2);

  // Whether or not to show labels on the sidebar
  // (based on the width of the sidebar & window)
  const [showLabels, setShowLabels] = useState(false);

  const user = useUser();

  // Add resize listener so we can conditionally set the minSize of the sidebar based on the width of the window
  useEffect(() => {
    // When the window itsself is resized, update the sidebar accordingly
    const handleResize = () => {
      const newMinSize = window.innerWidth < 768 ? 10 : 5;
      const collapsedSize = window.innerWidth < 768 ? 3 : 1;

      setScreenWidth(window.innerWidth);
      setShowLabels(window.innerWidth > 850 && sidebarCurrentSize > 13);
      setMinSize(newMinSize);
      setCollapsedSize(collapsedSize);
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-screen  rounded-lg border"
    >
      <ResizablePanel
        onResize={(e) => {
          // Set this just so we can track the current sidebar size
          setSidebarCurrentSize(e);
          // When the sidebar is resized, update the showLabels state accordingly
          setShowLabels(window.innerWidth > 850 && sidebarCurrentSize > 13);
        }}
        className="sm:min-w-[50px] "
        defaultSize={minSize}
        minSize={minSize}
        collapsedSize={collapsedSize}
        maxSize={20}
        collapsible={true}
      >
        <div className="flex flex-col items-center border-b-[1.5px] bg-blend-color-burn">
          <div
            className="flex w-full cursor-default flex-row items-center justify-center gap-2 border 
                                border-input bg-background p-2"
          >
            {!user.isLoaded ? <UserRoundIcon /> : <UserButton />}
            {showLabels && (
              <p className="hidden flex-grow-0 text-base font-semibold sm:block">
                {user?.user?.fullName}
              </p>
            )}
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
                    {showLabels && (
                      <p className="ml-1 hidden w-full text-start font-semibold sm:block">
                        Dashboard
                      </p>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="self-start font-semibold"
                >
                  <p>Dashboard</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip delayDuration={50}>
                <TooltipTrigger className="w-full self-start">
                  <div className="my-1 flex flex-row items-center justify-between gap-2 rounded-lg border border-none border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground">
                    <Link href="/dashboard">
                      <BookType />
                    </Link>
                    {showLabels && (
                      <p className="ml-1 hidden w-full text-start font-semibold sm:block">
                        Notes
                      </p>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Notes</p>
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
                    {showLabels && (
                      <p className="ml-1 hidden w-full text-start font-semibold sm:block ">
                        Activity
                      </p>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-semibold">Activity</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      {/** TODO: Figure out a way to prevent the sidebar from "overlapping" the main content in the page here (the {children}) */}
      <ResizablePanel defaultSize={75} minSize={75}>
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
