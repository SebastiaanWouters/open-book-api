import type { SearchResult } from "./types.ts";
import { DOMParser } from "@deno/dom";

export async function search(
  query: string,
  type: "book" | "paper" = "book",
  n: number = 10, // Default number of results
): Promise<SearchResult[]> {
  const url = new URL("https://annas-archive.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("index", type === "book" ? "" : "journals");

  const response = await fetch(url);
  const text = await response.text();
  const doc = new DOMParser().parseFromString(text, "text/html");

  // Extract results from the DOM
  const results: SearchResult[] = [];
  const items = doc.querySelectorAll('a[href^="/md5"]'); // Outer selector for result items
  for (let i = 0; i < Math.min(n, items.length); i++) {
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
