import gleam/string
import filepath

// Generate glue code.
pub fn generate_glue(modname: String) -> String {
  let modname_base = filepath.base_name(modname)
  ["import { main } from './", modname_base, ".js'; main();"]
    |> string.concat
}
