import * as React from 'react'
import { cn } from '@/utils/classNames'

const Table = React.forwardRef(function Table({ className, ...props }, ref) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-body text-left border-collapse', className)}
        {...props}
      />
    </div>
  )
})
Table.displayName = 'Table'

const TableHeader = React.forwardRef(function TableHeader({ className, ...props }, ref) {
  return (
    <thead
      ref={ref}
      className={cn('[&_tr]:border-b border-[var(--border-subtle)] bg-[var(--paper)]', className)}
      {...props}
    />
  )
})
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef(function TableBody({ className, ...props }, ref) {
  return (
    <tbody
      ref={ref}
      className={cn('[&_tr:last-child]:border-0 divide-y divide-[var(--border-subtle)]', className)}
      {...props}
    />
  )
})
TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef(function TableFooter({ className, ...props }, ref) {
  return (
    <tfoot
      ref={ref}
      className={cn('border-t border-[var(--border-subtle)] bg-[var(--paper)] font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  )
})
TableFooter.displayName = 'TableFooter'

const TableRow = React.forwardRef(function TableRow({ className, selectable = false, selected = false, ...props }, ref) {
  return (
    <tr
      ref={ref}
      className={cn(
        'border-b border-[var(--border-subtle)] transition-colors duration-fast',
        selectable && 'cursor-pointer hover:bg-[var(--blue-wash)]/50',
        selected && 'bg-[var(--blue-wash)] border-l-2 border-l-[var(--blue-core)]',
        className
      )}
      {...props}
    />
  )
})
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef(function TableHead({ className, ...props }, ref) {
  return (
    <th
      ref={ref}
      className={cn(
        'h-9 px-3 py-1.5 text-left align-middle text-label font-semibold uppercase tracking-wider text-[var(--ink-muted)] [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
})
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef(function TableCell({ className, ...props }, ref) {
  return (
    <td
      ref={ref}
      className={cn('px-3 py-2.5 align-middle text-body text-[var(--ink)] [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  )
})
TableCell.displayName = 'TableCell'

const TableCaption = React.forwardRef(function TableCaption({ className, ...props }, ref) {
  return (
    <caption
      ref={ref}
      className={cn('mt-3 text-caption text-[var(--ink-muted)]', className)}
      {...props}
    />
  )
})
TableCaption.displayName = 'TableCaption'

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}