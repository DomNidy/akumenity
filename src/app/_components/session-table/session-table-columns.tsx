"use client";

import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { SessionTableItem } from "./session-table-definitions";
import { TopicLabel } from "../my-topics/topic-label";
import { formatTime } from "~/lib/utils";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { SessionTableFilterCombobox } from "./session-table-filter-combobox";

// Helper function to create columns
const columnHelper = createColumnHelper<SessionTableItem>();

// The icon to display for sorting
const SortIcon = () => <ArrowUpDown className="inset-0 m-auto h-4 w-4" />;

export const sessionTableColumns: ColumnDef<SessionTableItem>[] = [
  // Display column to display checkbox
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.group({
    header: "Topic",
    columns: [
      columnHelper.accessor("topicName", {
        id: "Topic",
        enableColumnFilter: true,
        filterFn: "arrIncludesSome",
        header: ({ column, table }) => {
          return (
            <div className="flex flex-row items-center gap-2">
              <p>Topic</p>
              <div className="flex">
                <Button
                  variant="ghost"
                  onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                  }
                >
                  <SortIcon />
                </Button>
              </div>

              <SessionTableFilterCombobox
                setFilterValue={column.setFilterValue}
                filterOptionsArray={table
                  .getCoreRowModel()
                  .rows.map((item) => ({
                    key: item.getValue(column.id),
                    value: item.getValue(column.id),
                  }))}
              />
            </div>
          );
        },
        cell: (props) => (
          <div className="flex flex-row gap-2">
            <TopicLabel colorCode={props.row.original.topicColorCode} />
            <h3 className="font-semibold">{props.row.original.topicName}</h3>
          </div>
        ),
      }),

      columnHelper.accessor("topicSessionId", {
        id: "Session ID",
        header: "Session ID",
        enableColumnFilter: false,
        cell: (props) => <h3>{props.row.original.topicSessionId}</h3>,
      }),
    ],
  }),
  columnHelper.group({
    header: "Session",
    columns: [
      columnHelper.accessor("sessionStartMS", {
        id: "Start Time",
        header: ({ column }) => {
          return (
            <Button
              className="gap-2"
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Start Time
              <SortIcon />
            </Button>
          );
        },
        cell: (props) => (
          <h3>
            {new Date(props.row.original.sessionStartMS).toLocaleString()}
          </h3>
        ),
      }),
      columnHelper.accessor("sessionEndMS", {
        id: "End Time",
        header: ({ column }) => {
          return (
            <Button
              className="gap-2"
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              End Time
              <SortIcon />
            </Button>
          );
        },
        cell: (props) => (
          <h3>{new Date(props.row.original.sessionEndMS).toLocaleString()}</h3>
        ),
      }),

      columnHelper.accessor("sessionDurationMS", {
        id: "Duration",
        header: ({ column }) => {
          return (
            <Button
              className="gap-2"
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Duration
              <SortIcon />
            </Button>
          );
        },
        cell: (props) => (
          <h3>{formatTime(props.row.original.sessionDurationMS)}</h3>
        ),
      }),
    ],
  }),
];
