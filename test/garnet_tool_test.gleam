import garnet_tool/internal
import gleeunit
import gleeunit/should

pub fn main() {
  gleeunit.main()
}

pub fn generate_glue_test() {
  let modname = "temari"
  let expect = "import { main } from './temari.js'; main();"
  let actual = internal.generate_glue(modname)

  should.equal(actual, expect)
}
