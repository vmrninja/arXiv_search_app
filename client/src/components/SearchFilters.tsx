import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ARXIV_CATEGORIES } from '@/lib/arxiv';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

export interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading?: boolean;
}

export interface SearchFilters {
  query: string;
  author: string;
  title: string;
  abstract: string;
  category: string;
  startDate: string;
  endDate: string;
}

export default function SearchFilters({ onSearch, isLoading }: SearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    author: '',
    title: '',
    abstract: '',
    category: '',
    startDate: '',
    endDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      query: '',
      author: '',
      title: '',
      abstract: '',
      category: '',
      startDate: '',
      endDate: '',
    });
  };

  const hasFilters = Object.values(filters).some((value) => value !== '');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search all fields..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="pl-10"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={showAdvanced ? 'bg-accent' : ''}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        <Button type="submit" disabled={isLoading || !hasFilters}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {showAdvanced && (
        <div className="bg-card border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Advanced Filters</h3>
            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Search in title..."
                value={filters.title}
                onChange={(e) => setFilters({ ...filters, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                type="text"
                placeholder="Author name..."
                value={filters.author}
                onChange={(e) => setFilters({ ...filters, author: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="abstract">Abstract</Label>
              <Input
                id="abstract"
                type="text"
                placeholder="Search in abstract..."
                value={filters.abstract}
                onChange={(e) => setFilters({ ...filters, abstract: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={filters.category || undefined}
                onValueChange={(value) => setFilters({ ...filters, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {ARXIV_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value || 'all'} value={cat.value || 'all'}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
