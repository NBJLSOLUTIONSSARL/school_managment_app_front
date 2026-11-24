import { TableRow, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

export function EntityTableSkeleton({ columns = [], rowCount = 6 }) {
  const colCount = Math.max(1, columns.length)

  return (
    <>
      {Array.from({ length: rowCount }).map((_, rIdx) => (
        <TableRow key={`skeleton-row-${rIdx}`} className="h-11">
          {Array.from({ length: colCount }).map((__, cIdx) => {
            const col = columns[cIdx]
            const widthClass =
              cIdx === 0
                ? 'w-36 sm:w-48'
                : cIdx === colCount - 1
                  ? 'w-16 ml-auto'
                  : 'w-24 sm:w-32'

            return (
              <TableCell
                key={`skeleton-cell-${rIdx}-${cIdx}`}
                className={col?.align === 'right' ? 'text-right' : col?.align === 'center' ? 'text-center' : ''}
              >
                <div
                  className={`inline-block ${
                    col?.align === 'right' ? 'float-right' : col?.align === 'center' ? 'mx-auto' : ''
                  }`}
                >
                  <Skeleton className={`h-4 rounded-md ${widthClass}`} />
                </div>
              </TableCell>
            )
          })}
        </TableRow>
      ))}
    </>
  )
}
