import { download, search } from "./mod.ts";

const books = await search("antibodies");
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

const dl = await download(books[0].md5, "6WgoiFL2scCsV3wmmcEEmTd7uMzAC");
if (dl.error) {
  console.error(dl.error.message);
}
console.log(JSON.stringify(dl));
await Deno.writeFile("./download.pdf", new Uint8Array(dl.result!.content));
