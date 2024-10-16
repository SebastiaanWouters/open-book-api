import { assertStringIncludes } from "@std/assert";
import { search } from "./mod.ts";

Deno.test(async function searchTest() {
  const res = await search("bob");
  assertStringIncludes(
    res.content,
    "Imagination Fully Dilated-Science Fiction",
  );
});
