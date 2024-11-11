import { download, search } from "./mod.ts";
import "jsr:@std/dotenv/load";

const books = await search("antibodies", { amount: 50 });
for (const book of books) {
  console.log(JSON.stringify(book));
}

console.log("\n----------------------------------------------------------- \n");

const papers = await search("monoclonal antibodies", {
  type: "article",
  amount: 3,
});
for (const paper of papers) {
  console.log(JSON.stringify(paper));
}

console.log("\n----------------------------------------------------------- \n");

const dl = await download(books[0].md5, Deno.env.get("API_KEY")!);
if (dl.error) {
  console.error(dl.error.message);
} else {
  console.log("Download: ", dl.result?.url);
}
