"use client";

import { useEffect, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";
import { LayoutDashboard, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function Sidebar({ children }: { children: React.ReactNode }) {

    const [minSize, setMinSize] = useState(10);

    const user = useUser();


    // Add resize listener so we can conditionally set the minSize of the sidebar based on the width of the window
    useEffect(() => {
        const handleResize = () => {
            const newSize = window.innerWidth < 768 ? 15 : 5;
            setMinSize(newSize)
            console.log('minSize', minSize)
            console.log('window.innerWidth', window.innerWidth)
            console.log('newSize', newSize);
        };

        window.addEventListener('resize', handleResize);

        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);


    return <ResizablePanelGroup
        direction="horizontal"
        className="min-h-screen rounded-lg border"
    >
        <ResizablePanel
            onResize={(e) => console.log(e)}
            defaultSize={25}
            minSize={minSize}
            collapsedSize={minSize}
            maxSize={25}
            collapsible={true}  >
            <div className="flex flex-col ">
                <div className="flex-row items-center justify-center flex p-2 gap-2 w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                    <UserRoundIcon className="flex-shrink-0" size={25} />
                    <p className="font-semibold hidden sm:block">{user?.user?.fullName}</p>
                </div>
                <TooltipProvider >
                    <Tooltip delayDuration={50}>
                        <TooltipTrigger>
                            {/** TODO: Continue working on sidebar, add the clerk userbutton here */}
                            <div className="w-full border-none border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                                <Link href="/dashboard">
                                    <LayoutDashboard />
                                </Link>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p className="font-semibold">Dashboard</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
            {children}
        </ResizablePanel>
    </ResizablePanelGroup>
}