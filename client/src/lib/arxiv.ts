/**
 * ArXiv API Service
 * Documentation: https://info.arxiv.org/help/api/user-manual.html
 */

export interface ArxivSearchParams {
  query?: string;
  author?: string;
  title?: string;
  abstract?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  start?: number;
  maxResults?: number;
  sortBy?: 'relevance' | 'lastUpdatedDate' | 'submittedDate';
  sortOrder?: 'ascending' | 'descending';
}

export interface ArxivEntry {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  updated: string;
  categories: string[];
  pdfUrl: string;
  abstractUrl: string;
  doi?: string;
  comment?: string;
  journalRef?: string;
}

export interface ArxivSearchResult {
  entries: ArxivEntry[];
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
}

const ARXIV_API_BASE = 'https://export.arxiv.org/api/query';

/**
 * Build search query string from parameters
 */
function buildSearchQuery(params: ArxivSearchParams): string {
  const parts: string[] = [];

  if (params.query) {
    parts.push(`all:${params.query}`);
  }
  if (params.title) {
    parts.push(`ti:${params.title}`);
  }
  if (params.author) {
    parts.push(`au:${params.author}`);
  }
  if (params.abstract) {
    parts.push(`abs:${params.abstract}`);
  }
  if (params.category) {
    parts.push(`cat:${params.category}`);
  }

  return parts.join(' AND ');
}

/**
 * Parse Atom XML response from ArXiv API
 */
function parseArxivResponse(xmlText: string): ArxivSearchResult {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  // Get feed metadata
  const totalResults = parseInt(
    xmlDoc.querySelector('opensearch\\:totalResults, totalResults')?.textContent || '0'
  );
  const startIndex = parseInt(
    xmlDoc.querySelector('opensearch\\:startIndex, startIndex')?.textContent || '0'
  );
  const itemsPerPage = parseInt(
    xmlDoc.querySelector('opensearch\\:itemsPerPage, itemsPerPage')?.textContent || '0'
  );

  // Parse entries
  const entries: ArxivEntry[] = [];
  const entryElements = xmlDoc.querySelectorAll('entry');

  entryElements.forEach((entry) => {
    const id = entry.querySelector('id')?.textContent || '';
    const title = entry.querySelector('title')?.textContent?.trim().replace(/\s+/g, ' ') || '';
    const summary = entry.querySelector('summary')?.textContent?.trim().replace(/\s+/g, ' ') || '';
    const published = entry.querySelector('published')?.textContent || '';
    const updated = entry.querySelector('updated')?.textContent || '';

    // Get authors
    const authorElements = entry.querySelectorAll('author name');
    const authors = Array.from(authorElements).map((author) => author.textContent || '');

    // Get categories
    const categoryElements = entry.querySelectorAll('category');
    const categories = Array.from(categoryElements).map(
      (cat) => cat.getAttribute('term') || ''
    );

    // Get links
    const links = entry.querySelectorAll('link');
    let pdfUrl = '';
    let abstractUrl = '';

    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const title = link.getAttribute('title') || '';
      if (title === 'pdf') {
        pdfUrl = href;
      } else if (link.getAttribute('rel') === 'alternate') {
        abstractUrl = href;
      }
    });

    // Get optional fields
    const doi = entry.querySelector('arxiv\\:doi, doi')?.textContent || undefined;
    const comment = entry.querySelector('arxiv\\:comment, comment')?.textContent || undefined;
    const journalRef = entry.querySelector('arxiv\\:journal_ref, journal_ref')?.textContent || undefined;

    entries.push({
      id,
      title,
      summary,
      authors,
      published,
      updated,
      categories,
      pdfUrl,
      abstractUrl,
      doi,
      comment,
      journalRef,
    });
  });

  return {
    entries,
    totalResults,
    startIndex,
    itemsPerPage,
  };
}

/**
 * Search ArXiv papers
 */
export async function searchArxiv(params: ArxivSearchParams): Promise<ArxivSearchResult> {
  const searchQuery = buildSearchQuery(params);
  
  if (!searchQuery && !params.category) {
    throw new Error('At least one search parameter is required');
  }

  const urlParams = new URLSearchParams();
  
  if (searchQuery) {
    urlParams.append('search_query', searchQuery);
  }
  
  urlParams.append('start', (params.start || 0).toString());
  urlParams.append('max_results', (params.maxResults || 10).toString());
  
  if (params.sortBy) {
    urlParams.append('sortBy', params.sortBy);
  }
  
  if (params.sortOrder) {
    urlParams.append('sortOrder', params.sortOrder);
  }

  const url = `${ARXIV_API_BASE}?${urlParams.toString()}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`ArXiv API error: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    return parseArxivResponse(xmlText);
  } catch (error) {
    console.error('ArXiv API error:', error);
    throw error;
  }
}

/**
 * Get ArXiv categories
 */
export const ARXIV_CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'cs.AI', label: 'Artificial Intelligence' },
  { value: 'cs.CL', label: 'Computation and Language' },
  { value: 'cs.CV', label: 'Computer Vision' },
  { value: 'cs.LG', label: 'Machine Learning' },
  { value: 'cs.NE', label: 'Neural and Evolutionary Computing' },
  { value: 'cs.CR', label: 'Cryptography and Security' },
  { value: 'cs.DB', label: 'Databases' },
  { value: 'cs.DS', label: 'Data Structures and Algorithms' },
  { value: 'math.CO', label: 'Combinatorics' },
  { value: 'math.NT', label: 'Number Theory' },
  { value: 'math.AG', label: 'Algebraic Geometry' },
  { value: 'physics.comp-ph', label: 'Computational Physics' },
  { value: 'physics.data-an', label: 'Data Analysis' },
  { value: 'q-bio.GN', label: 'Genomics' },
  { value: 'q-bio.NC', label: 'Neurons and Cognition' },
  { value: 'q-fin.CP', label: 'Computational Finance' },
  { value: 'stat.ML', label: 'Machine Learning (Statistics)' },
  { value: 'stat.AP', label: 'Applications (Statistics)' },
];
