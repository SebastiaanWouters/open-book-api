export interface SearchResult {
        meta: string;
        md5: string;
        title: string;
        author: string;
        cover?: string;
        publisher: string;
}

export interface SearchOptions {
        type?: "book" | "article";
        ext?: "pdf" | "epub";
        page?: number;
        amount?: number;
}

export interface DownloadResult {
        url: string;
}
