"use client";

import { useEffect, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { BarChart2Icon, BookType, LayoutDashboard, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

export default function Sidebar({ children }: { children: React.ReactNode }) {

    const [screenWidth, setScreenWidth] = useState(0);

    // The minimum size the sidebar should be (does not apply when collapsed)
    const [minSize, setMinSize] = useState(10);
    const [sidebarCurrentSize, setSidebarCurrentSize] = useState(10);
    const [collapsedSize, setCollapsedSize] = useState(2);


    const user = useUser();


    // Add resize listener so we can conditionally set the minSize of the sidebar based on the width of the window
    useEffect(() => {
        const handleResize = () => {
            const newMinSize = window.innerWidth < 768 ? 10 : 5;
            const collapsedSize = window.innerWidth < 768 ? 2 : 1;

            setScreenWidth(window.innerWidth)
            setMinSize(newMinSize)
            setCollapsedSize(collapsedSize)
        };

        window.addEventListener('resize', handleResize);

        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);


    return <ResizablePanelGroup
        direction="horizontal"
        className="min-h-screen fixed rounded-lg border"
    >
        <ResizablePanel
            onResize={(e) => {
                console.log('Panel resized', e);
                setSidebarCurrentSize(e);
            }}
            className="sm:min-w-[50px]"
            defaultSize={minSize}
            minSize={minSize}
            collapsedSize={collapsedSize}
            maxSize={25}
            collapsible={true}>

            <div className="flex flex-col items-center border-b-[1.5px]">
                <div className="flex-row items-center justify-center flex p-2 gap-2 w-full border 
                                border-input bg-background cursor-default">
                    <UserButton />
                    {(sidebarCurrentSize > 15 && screenWidth > 850) && <p className="sm:block flex-grow-0 hidden font-semibold text-base">{user?.user?.fullName}</p>}
                </div>
                <TooltipProvider>
                    <Tooltip delayDuration={50}>
                        <TooltipTrigger className="w-32 flex justify-center">
                            {/** TODO: Continue working on sidebar, add the clerk userbutton here */}
                            <div className="justify-between px-4 gap-2 rounded-lg py-2 my-1 flex flex-row items-center border-none border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                                <Link href="/dashboard">
                                    <LayoutDashboard />
                                </Link>
                                {(sidebarCurrentSize > 13 && screenWidth > 850) && <p className="sm:block flex-grow-0 hidden font-semibold text-base ">Dashboard</p>}

                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p className="font-semibold">Dashboard</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip delayDuration={50}>
                        <TooltipTrigger className="w-32 flex justify-center">
                            <div className="justify-between px-4 gap-2 rounded-lg py-2 my-1 flex flex-row items-center 
                                            border-none border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                                <Link href="/dashboard">
                                    <BookType />
                                </Link>
                                {(sidebarCurrentSize > 13 && screenWidth > 850) && <p className="sm:block flex-grow-0 hidden font-semibold text-base ">Notes</p>}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p className="font-semibold">Notes</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip delayDuration={50}>
                        <TooltipTrigger className="w-32 flex justify-center">
                            <div className="justify-between px-4 gap-2 rounded-lg py-2 my-1 flex flex-row items-center 
                                            border-none border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                                <Link href="/dashboard">
                                    <BarChart2Icon />
                                </Link>
                                {(sidebarCurrentSize > 13 && screenWidth > 850) && <p className="sm:block flex-grow-0 hidden font-semibold text-base ">Activity</p>}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p className="font-semibold">Activity</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        {/** TODO: Figure out a way to prevent the sidebar from "overlapping" the main content in the page here (the {children}) */}
        <ResizablePanel defaultSize={75} minSize={75}>
            {children}
        </ResizablePanel>
    </ResizablePanelGroup>
}