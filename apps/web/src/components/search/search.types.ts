export type BookSummary = {
  isbn: string | null;
  title: string;
  authors: string[];
  thumbnail: string | null;
  libraryBookId?: string | null;
};

export type SearchApiResponse = {
  books?: BookSummary[];
  hasMore?: boolean;
  nextOffset?: number;
  error?: {
    code?: string;
  };
};
