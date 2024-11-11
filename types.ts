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

export interface DownloadResult {
  content: string;
  extension: string;
  extra: ExtraDownloadInfo;
  url: string;
}

export interface ExtraDownloadInfo {
  downloads_left: number;
  recent_downloads: string[];
}
