"use client";
import {
  BarChart2Icon,
  BookType,
  LayoutDashboard,
  UserRoundIcon,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { SidebarLinkButton } from "./sidebar-link-button";

export default function Sidebar() {
  const user = useUser();

  return (
    <div className="fixed left-0 top-0 z-[10] h-screen w-14 overflow-x-hidden sm:w-24">
      <div className="h-full cursor-default gap-2 border border-input bg-background p-2">
        <div className="flex flex-col items-center rounded-md border border-x-0 border-input p-1">
          {!user.isLoaded ? <UserRoundIcon /> : <UserButton />}
          <SidebarLinkButton href="/dashboard" label="Dashboard">
            <LayoutDashboard />
          </SidebarLinkButton>

          <SidebarLinkButton href="/dashboard/my-topics" label="Topics">
            <BookType />
          </SidebarLinkButton>

          <SidebarLinkButton href="/dashboard/sessions" label="Sessions">
            <BarChart2Icon />
          </SidebarLinkButton>
        </div>
      </div>
    </div>
  );
}
