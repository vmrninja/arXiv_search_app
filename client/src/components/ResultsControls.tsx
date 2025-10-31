import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';

interface ResultsControlsProps {
  totalResults: number;
  sortBy: string;
  sortOrder: string;
  onSortChange: (sortBy: string, sortOrder: string) => void;
}

export default function ResultsControls({
  totalResults,
  sortBy,
  sortOrder,
  onSortChange,
}: ResultsControlsProps) {
  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'descending' ? 'ascending' : 'descending';
    onSortChange(sortBy, newOrder);
  };

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="text-sm text-muted-foreground">
        Found <span className="font-medium text-foreground">{totalResults.toLocaleString()}</span>{' '}
        results
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        <Select
          value={sortBy}
          onValueChange={(value) => onSortChange(value, sortOrder)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="submittedDate">Submitted Date</SelectItem>
            <SelectItem value="lastUpdatedDate">Updated Date</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleSortOrder}
          title={sortOrder === 'descending' ? 'Sort ascending' : 'Sort descending'}
        >
          {sortOrder === 'descending' ? (
            <ArrowDownAZ className="h-4 w-4" />
          ) : (
            <ArrowUpAZ className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
