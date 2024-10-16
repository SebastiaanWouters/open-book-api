export interface SearchResult {
  md5: string;
  title: string;
  author: string;
  cover?: string;
}

export interface SearchOptions {
  type?: "book" | "article";
  amount?: number;
}
