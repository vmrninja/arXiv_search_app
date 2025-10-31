import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ArxivEntry } from '@/lib/arxiv';
import { Calendar, ExternalLink, FileText, Users } from 'lucide-react';

interface PaperCardProps {
  paper: ArxivEntry;
}

export default function PaperCard({ paper }: PaperCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight mb-2">
              <a
                href={paper.abstractUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {paper.title}
              </a>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm">
              <Users className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{paper.authors.slice(0, 3).join(', ')}</span>
              {paper.authors.length > 3 && (
                <span className="text-muted-foreground">+{paper.authors.length - 3} more</span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              asChild
            >
              <a href={paper.abstractUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Abstract
              </a>
            </Button>
            <Button
              size="sm"
              asChild
            >
              <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="h-3 w-3 mr-1" />
                PDF
              </a>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{paper.summary}</p>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Published: {formatDate(paper.published)}</span>
          </div>
          {paper.updated !== paper.published && (
            <div className="flex items-center gap-1">
              <span>•</span>
              <span>Updated: {formatDate(paper.updated)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {paper.categories.slice(0, 5).map((category) => (
            <Badge key={category} variant="secondary" className="text-xs">
              {category}
            </Badge>
          ))}
          {paper.categories.length > 5 && (
            <Badge variant="outline" className="text-xs">
              +{paper.categories.length - 5}
            </Badge>
          )}
        </div>

        {(paper.doi || paper.journalRef) && (
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            {paper.doi && (
              <div>
                <span className="font-medium">DOI:</span> {paper.doi}
              </div>
            )}
            {paper.journalRef && (
              <div>
                <span className="font-medium">Journal:</span> {paper.journalRef}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
