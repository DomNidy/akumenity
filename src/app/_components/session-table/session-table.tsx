"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  type SortingState,
  getSortedRowModel,
  type ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { useState } from "react";
import { type SessionTableItem } from "./session-table-definitions";

interface SessionTableProps<TValue> {
  columns: ColumnDef<SessionTableItem, TValue>[];
  data: SessionTableItem[];

  // Function which fetches the next page of data (relative to the react query hook)
  fetchNextPage: () => void;

  // Function which fetches the previous page of data (relative to the react query hook)
  fetchPreviousPage: () => void;
}

export function SessionTable<TValue>({
  columns,
  data,
  fetchNextPage,
  fetchPreviousPage,
}: SessionTableProps<TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "Start Time", desc: true },
  ]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,

    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No data
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex w-full flex-1 justify-end gap-2 p-2 ">
        <Button
          variant={"outline"}
          className="font-semibold"
          onClick={() => {
            fetchPreviousPage();
            table.previousPage();
          }}
          disabled={!table.getCanPreviousPage()}
        >
          Prev
        </Button>

        <Button
          className="font-semibold"
          variant={"outline"}
          onClick={() => {
            fetchNextPage();
            table.nextPage();
          }}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
