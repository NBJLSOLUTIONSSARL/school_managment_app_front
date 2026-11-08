import * as React from 'react'
import { cn } from '@/utils/classNames'

const Table = React.forwardRef(function Table({ className, ...props }, ref) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-xs text-left border-collapse', className)}
        {...props}
      />
    </div>
  )
})
Table.displayName = 'Table'

const TableHeader = React.forwardRef(function TableHeader({ className, ...props }, ref) {
  return <thead ref={ref} className={cn('[&_tr]:border-b border-[#E2E8F0] bg-[#F8FAFC]', className)} {...props} />
})
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef(function TableBody({ className, ...props }, ref) {
  return (
    <tbody
      ref={ref}
      className={cn('[&_tr:last-child]:border-0 divide-y divide-[#E2E8F0]', className)}
      {...props}
    />
  )
})
TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef(function TableFooter({ className, ...props }, ref) {
  return (
    <tfoot
      ref={ref}
      className={cn('border-t border-[#E2E8F0] bg-[#F8FAFC] font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  )
})
TableFooter.displayName = 'TableFooter'

const TableRow = React.forwardRef(function TableRow({ className, ...props }, ref) {
  return (
    <tr
      ref={ref}
      className={cn(
        'border-b border-[#E2E8F0] transition-colors hover:bg-slate-50 data-[state=selected]:bg-[#F1F5F9]',
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
        'h-8 px-3 py-1.5 text-left align-middle text-[10px] font-bold uppercase tracking-wider text-[#64748B] [&:has([role=checkbox])]:pr-0',
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
      className={cn('p-2.5 px-3 align-middle text-xs text-[#0F172A] [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  )
})
TableCell.displayName = 'TableCell'

const TableCaption = React.forwardRef(function TableCaption({ className, ...props }, ref) {
  return (
    <caption
      ref={ref}
      className={cn('mt-3 text-[11px] text-[#64748B]', className)}
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
