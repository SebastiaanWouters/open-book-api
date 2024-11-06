import type { DownloadResult, SearchOptions, SearchResult } from "./types.ts";
import { fileExtension } from "file-types";
import { DOMParser } from "@deno/dom";

/**
 * search anna's archive based on a query, type of results (books / papers) and amount based on params
 */
export async function search(
  query: string,
  options?: SearchOptions,
): Promise<SearchResult[]> {
  const url = new URL("https://annas-archive.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set(
    "index",
    options?.type === "article" ? "journals" : "book",
  );

  const response = await fetch(
    "https://corsproxy.io/?" + encodeURIComponent(url.toString()),
  );
  const text = await response.text();
  const doc = new DOMParser().parseFromString(text, "text/html");

  // Extract results from the DOM
  const results: SearchResult[] = [];
  const items = doc.querySelectorAll('a[href^="/md5"]'); // Outer selector for result items
  for (let i = 0; i < Math.min(options?.amount ?? 10, items.length); i++) {
    const item = items[i];

    const title = item.querySelector("h3")?.textContent ?? "No Title"; // Title inside h3
    const md5 = item.getAttribute("href")?.slice(5) ??
      "empty";
    const author = item.querySelector("div.italic")?.textContent ??
      "Unknown Author"; // Author inside div with class italic
    const cover = item.querySelector("img")?.getAttribute("src") ??
      undefined;

    results.push({
      md5,
      title,
      author,
      cover,
    });
  }

  return results;
}

export async function download(
  md5: string,
  key: string,
): Promise<{ result: DownloadResult | null; error: Error | null }> {
  const url = new URL("https://annas-archive.org/dyn/api/fast_download.json");
  url.searchParams.set("md5", md5);
  url.searchParams.set("key", key);
  const response = await fetch(url);
  if (!response.ok) {
    return {
      result: null,
      error: new Error("Failed Download"),
    };
  }
  const result = await response.json();
  const content_raw = await fetch(result.download_url);
  const extension = fileExtension(result.download_url);

  if (!content_raw.ok) {
    return {
      result: null,
      error: new Error("Failed Download"),
    };
  }
  const content_array = await content_raw.arrayBuffer();
  return {
    result: {
      content: content_array,
      extension,
      extra: {
        downloads_left: result.account_fast_download_info.downloads_left,
        recent_downloads:
          result.account_fast_download_info.recently_downloaded_md5s,
      },
    },
    error: null,
  };
}
