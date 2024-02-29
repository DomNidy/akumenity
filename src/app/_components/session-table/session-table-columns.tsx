"use client";

import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { SessionTableItem } from "./session-table-definitions";
import { TopicLabel } from "../my-topics/topic-label";
import { formatTime } from "~/lib/utils";

// Helper function to create columns
const columnHelper = createColumnHelper<SessionTableItem>();

export const sessionTableColumns: ColumnDef<SessionTableItem>[] = [
  // Display column to display checkbox
  columnHelper.display({
    id: "actions",
    header: () => <h3 className="font-semibold tracking-tight">Select</h3>,
    cell: (props) => (
      <div
        className="h-6 w-6 cursor-pointer rounded-lg bg-red-400"
        {...props}
      ></div>
    ),
  }),
  columnHelper.group({
    header: "Topic",
    columns: [
      columnHelper.accessor("topicName", {
        id: "Topic",
        header: "Topic Name",
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
        cell: (props) => <h3>{props.row.original.topicSessionId}</h3>,
      }),
    ],
  }),
  columnHelper.group({
    header: "Session",
    columns: [
      columnHelper.accessor("sessionStartMS", {
        id: "Start Time",
        header: "Start Time",
        cell: (props) => (
          <h3>
            {new Date(props.row.original.sessionStartMS).toLocaleString()}
          </h3>
        ),
      }),
      columnHelper.accessor("sessionEndMS", {
        id: "End Time",
        header: "End Time",
        cell: (props) => (
          <h3>{new Date(props.row.original.sessionEndMS).toLocaleString()}</h3>
        ),
      }),

      columnHelper.accessor("sessionDurationMS", {
        id: "Duration",
        header: "Duration",
        cell: (props) => (
          <h3>{formatTime(props.row.original.sessionDurationMS)}</h3>
        ),
      }),
    ],
  }),
];
