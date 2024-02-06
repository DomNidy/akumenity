// Renders out the context menu for the calendar grid column (the menu displayed when you click on the column)

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../ui/context-menu";

export default function CalendarGridColumnContextMenu({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <>{children}</>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>View</ContextMenuItem>
        <ContextMenuItem>View 2</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
