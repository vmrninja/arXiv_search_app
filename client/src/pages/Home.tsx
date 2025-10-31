import PaperCard from '@/components/PaperCard';
import ResultsControls from '@/components/ResultsControls';
import SearchFilters, { type SearchFilters as SearchFiltersType } from '@/components/SearchFilters';
import { Button } from '@/components/ui/button';
import { APP_TITLE } from '@/const';
import { searchArxiv, type ArxivEntry, type ArxivSearchResult } from '@/lib/arxiv';
import { AlertCircle, BookOpen, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Home() {
  const [results, setResults] = useState<ArxivSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'relevance' | 'submittedDate' | 'lastUpdatedDate'>('relevance');
  const [sortOrder, setSortOrder] = useState<'ascending' | 'descending'>('descending');
  const [lastFilters, setLastFilters] = useState<SearchFiltersType | null>(null);

  const resultsPerPage = 10;

  const handleSearch = async (filters: SearchFiltersType) => {
    setIsLoading(true);
    setCurrentPage(1);
    setLastFilters(filters);

    try {
      const result = await searchArxiv({
        query: filters.query || undefined,
        author: filters.author || undefined,
        title: filters.title || undefined,
        abstract: filters.abstract || undefined,
        category: filters.category || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        start: 0,
        maxResults: resultsPerPage,
        sortBy,
        sortOrder,
      });

      setResults(result);

      if (result.entries.length === 0) {
        toast.info('No results found', {
          description: 'Try adjusting your search filters',
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed', {
        description: error instanceof Error ? error.message : 'An error occurred while searching',
      });
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    if (!lastFilters) return;

    setIsLoading(true);
    setCurrentPage(page);

    try {
      const result = await searchArxiv({
        query: lastFilters.query || undefined,
        author: lastFilters.author || undefined,
        title: lastFilters.title || undefined,
        abstract: lastFilters.abstract || undefined,
        category: lastFilters.category || undefined,
        startDate: lastFilters.startDate || undefined,
        endDate: lastFilters.endDate || undefined,
        start: (page - 1) * resultsPerPage,
        maxResults: resultsPerPage,
        sortBy,
        sortOrder,
      });

      setResults(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Pagination error:', error);
      toast.error('Failed to load page');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy as typeof sortBy);
    setSortOrder(newSortOrder as typeof sortOrder);
  };

  // Re-search when sort changes
  useEffect(() => {
    if (lastFilters) {
      handleSearch(lastFilters);
    }
  }, [sortBy, sortOrder]);

  const totalPages = results ? Math.ceil(results.totalResults / resultsPerPage) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
              <p className="text-sm text-muted-foreground">
                Search millions of research papers from ArXiv
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Search Section */}
          <section className="bg-card border rounded-lg p-6 shadow-sm">
            <SearchFilters onSearch={handleSearch} isLoading={isLoading} />
          </section>

          {/* Results Section */}
          {isLoading && !results && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">Searching ArXiv...</p>
              </div>
            </div>
          )}

          {results && (
            <section className="space-y-6">
              {/* Results Controls */}
              <ResultsControls
                totalResults={results.totalResults}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
              />

              {/* Results List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : results.entries.length > 0 ? (
                <div className="space-y-4">
                  {results.entries.map((paper) => (
                    <PaperCard key={paper.id} paper={paper} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card border rounded-lg">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search filters or using different keywords
                  </p>
                </div>
              )}

              {/* Pagination */}
              {results.entries.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {currentPage > 2 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          disabled={isLoading}
                        >
                          1
                        </Button>
                        {currentPage > 3 && <span className="px-2">...</span>}
                      </>
                    )}

                    {currentPage > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={isLoading}
                      >
                        {currentPage - 1}
                      </Button>
                    )}

                    <Button variant="default" size="sm" disabled>
                      {currentPage}
                    </Button>

                    {currentPage < totalPages && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={isLoading}
                      >
                        {currentPage + 1}
                      </Button>
                    )}

                    {currentPage < totalPages - 1 && (
                      <>
                        {currentPage < totalPages - 2 && <span className="px-2">...</span>}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          disabled={isLoading}
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* Empty State */}
          {!results && !isLoading && (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Start Your Search</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter keywords, authors, or use advanced filters to discover research papers from
                ArXiv's extensive collection
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-6 bg-card/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            Powered by{' '}
            <a
              href="https://arxiv.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              ArXiv
            </a>
            . Thank you to arXiv for use of its open access interoperability.
          </p>
        </div>
      </footer>
    </div>
  );
}
