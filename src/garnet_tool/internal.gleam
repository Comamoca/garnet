import gleam/string

// Generate glue code.
pub fn generate_glue(modname: String) -> String {
  let template =
    ["import { main } from './", modname, ".js'; main();"]
    |> string.concat
}
