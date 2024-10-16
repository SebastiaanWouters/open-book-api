import { search } from "./mod.ts";

const books = await search("bob");
for (const book of books) {
  console.log(JSON.stringify(book));
}

console.log("\n----------------------------------------------------------- \n");

const papers = await search("monoclonal antibodies", "paper");
for (const paper of papers) {
  console.log(JSON.stringify(paper));
}
