import { assertStringIncludes } from "@std/assert";
import { download, search } from "./mod.ts";

Deno.test(async function searchTest() {
  const res = await search("bob");
  assertStringIncludes(
    res[0].title,
    "Imagination Fully Dilated-Science Fiction",
  );
});

Deno.test(async function downloadTest() {
  const res = await search("bob");
  const md5 = res[0].md5;
  const dlResult = await download(md5, "none-existing");
  assertStringIncludes(
    JSON.stringify(dlResult),
    "Invalid secret key",
  );
});
