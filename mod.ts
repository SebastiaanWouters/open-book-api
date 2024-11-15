import type { DownloadResult, SearchOptions, SearchResult } from "./types.ts";
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
  url.searchParams.set("page", options?.page?.toString() ?? "1");
  url.searchParams.set(
    "index",
    options?.type === "article" ? "journals" : "book",
  );
  if (options?.ext) {
    url.searchParams.set("ext", options.ext.toString());
  }

  const response = await fetch(
    "https://corsproxy.io/?" + encodeURIComponent(url.toString()),
  );
  let text = await response.text();
  text = text.replaceAll("<!--", "");
  text = text.replaceAll("-->", "");
  const doc = new DOMParser().parseFromString(text, "text/html");

  // Extract results from the DOM
  const results: SearchResult[] = [];
  const items = doc.querySelectorAll('a[href^="/md5"]'); // Outer selector for result items
  let limit = 0;
  if (options?.amount) {
    limit = Math.min(options.amount, items.length);
  } else {
    limit = items.length;
  }

  for (let i = 0; i < limit; i++) {
    const item = items[i];

    const meta = item.getElementsByClassName(
      "line-clamp-[2] leading-[1.2] text-[10px] lg:text-xs text-gray-500",
    )[0]?.textContent ??
      "No Meta"; // Title inside h3
    const title = item.querySelector("h3")?.textContent ?? "Unknown Title"; // Title inside h3
    const md5 = item.getAttribute("href")?.slice(5) ??
      "empty";
    const author = item.querySelector("div.italic")?.textContent ??
      "Unknown Author"; // Author inside div with class italic
    const publisher = item.querySelector("h3 + div")?.textContent ??
      "Unknown Publisher"; // Publisher under h3
    const cover = item.querySelector("img")?.getAttribute("src") ??
      undefined;

    let doi: string | undefined = undefined;

    if (options?.type === "article") {
      const articleUrl = "https://annas-archive.org/md5/" + md5;
      const articleHtml = await fetch(articleUrl).then((res) => res.text());
      const doc = new DOMParser().parseFromString(articleHtml, "text/html");
      // Find the parent element with the class 'js-md5-codes-tabs'
      const parentElement = doc.querySelector('.js-md5-codes-tabs') as HTMLElement;

      // If the parent element exists, search for the "DOI" element inside it
      if (parentElement) {
        const doiElement = Array.from(parentElement.children).find((el) => el.firstChild!.textContent!.trim() === 'DOI');

        // Check if the "DOI" element is found and has a next sibling
        if (doiElement && doiElement.firstChild!.nextSibling) {
          // Get the text content of the next sibling
          const nextSiblingText = doiElement.firstChild!.nextSibling.textContent!.trim();
          doi = nextSiblingText;
        }
      }
    }

    results.push({
      meta,
      md5,
      doi,
      title,
      author,
      publisher,
      cover,
    });
  }

  return results;
}

export async function download(
  id: string,
  type: "book" | "article",
  key: string,
): Promise<{ result: DownloadResult | null; error: Error | null }> {
  if (type === "book") {
    const url = new URL("https://annas-archive.org/dyn/api/fast_download.json");
    url.searchParams.set("md5", id);
    url.searchParams.set("key", key);
    const response = await fetch(url, { mode: 'no-cors' });

    if (response.ok) {
      const result = await response.json();
      if (result.download_url) {
        return {
          result: {
            url: result.download_url,
          },
          error: null,
        };
      }
    }
  } else {
    const url = new URL(`https://annas-archive.org/scidb/${id}`);
    const response = await fetch(url, { mode: 'no-cors' });
    if (response.ok) {
      const text = await response.text();
      const doc = new DOMParser().parseFromString(text, "text/html");
      const url = doc.querySelector('#left-side-menu > ul > li a[href^="https://"]')?.getAttribute("href");
      if (url) {
        return {
          result: {
            url: url,
          },
          error: null,
        };
      }
    }
  }
  return {
    result: null,
    error: new Error("Failed Download"),
  };

}

export type { DownloadResult, SearchOptions, SearchResult };
