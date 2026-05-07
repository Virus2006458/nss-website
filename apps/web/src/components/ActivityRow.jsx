import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';

const ActivityRow = ({ activity }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <TableRow className="hover:bg-muted/50 transition-colors duration-200">
      <TableCell className="font-medium">{formatDate(activity.date)}</TableCell>
      <TableCell>{activity.activityName}</TableCell>
      <TableCell className="text-right">
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm">
          {activity.hoursEarned}h
        </span>
      </TableCell>
    </TableRow>
  );
};

export default ActivityRow;