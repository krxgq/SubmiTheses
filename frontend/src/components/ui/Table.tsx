import React from 'react';

// Professional Table component for data display
// Features subtle headers, row hover states, and clean borders
// Supports striped rows and responsive overflow

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  hoverable?: boolean;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ striped = false, hoverable = true, className = '', children, ...props }, ref) => {
    return (
      <div className="overflow-x-auto rounded-lg border border-border">
        <table
          ref={ref}
          className={`w-full text-left text-sm ${className}`}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

// Table Header
interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={`bg-background-secondary border-b border-border ${className}`}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

TableHeader.displayName = 'TableHeader';

// Table Body
interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  striped?: boolean;
  hoverable?: boolean;
}

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ striped = false, hoverable = true, className = '', children, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={`
          divide-y divide-border
          ${striped ? '[&>tr:nth-child(even)]:bg-background-hover' : ''}
          ${hoverable ? '[&>tr]:hover:bg-background-hover' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = 'TableBody';

// Table Row
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={`transition-colors duration-200 ${className}`}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

// Table Header Cell
interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={`px-4 py-3 text-xs font-semibold text-text-primary uppercase tracking-wider ${className}`}
        {...props}
      >
        {children}
      </th>
    );
  }
);

TableHead.displayName = 'TableHead';

// Table Data Cell
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={`px-4 py-3 text-text-primary ${className}`}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';

// Table Footer
interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <tfoot
        ref={ref}
        className={`bg-background-secondary border-t border-border ${className}`}
        {...props}
      >
        {children}
      </tfoot>
    );
  }
);

TableFooter.displayName = 'TableFooter';
