import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "./EmptyState";

/**
 * A dense, sticky-header data table.
 * columns: [{ key, header, render?, className?, width? }]
 * rows: array
 * onRowClick: optional
 */
export function DataTable({
  columns,
  rows,
  loading,
  emptyTitle,
  emptyDescription,
  onRowClick,
  rowKey = "id",
  testId = "data-table",
  className,
}) {
  return (
    <div className={cn("rounded-md border border-border bg-white overflow-hidden", className)} data-testid={testId}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-secondary/60">
            <TableRow className="hover:bg-transparent">
              {columns.map((c) => (
                <TableHead
                  key={c.key}
                  className={cn(
                    "text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground h-10 px-4",
                    c.className
                  )}
                  style={c.width ? { width: c.width } : undefined}
                >
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-3/4" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!loading && rows?.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <EmptyState
                    title={emptyTitle || "No records yet"}
                    description={emptyDescription || "Once data is available, it will appear here."}
                    className="border-0 rounded-none"
                  />
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              rows?.map((row, idx) => {
                const key = row[rowKey] || row.publicId || row.id || idx;
                return (
                  <TableRow
                    key={key}
                    className={cn(
                      "border-b border-border last:border-0",
                      onRowClick && "cursor-pointer hover:bg-accent/50"
                    )}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    data-testid={`${testId}-row-${idx}`}
                  >
                    {columns.map((c) => (
                      <TableCell
                        key={c.key}
                        className={cn("px-4 py-3 text-sm", c.cellClassName)}
                      >
                        {c.render ? c.render(row) : row[c.key] ?? "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default DataTable;
