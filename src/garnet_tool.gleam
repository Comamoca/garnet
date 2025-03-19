import argv
import esgleam
import filepath
import garnet_tool/internal
import gleam/io
import gleam/string
import gleam_community/ansi
import shellout
import simplifile

const help_message = "garnet - Compile gleam to single binary, via Deno and Bun. 

Usage: garnet `target_module` `outname` `runtime`
  target_module(require):   Module name of compile target module.
  outname(require):         Name of output binary.
  runtime(default: deno):   Runtime of when use make single binary.
"

pub fn main() {
  let _ = case argv.load().arguments {
    [modname, outname, runtime] -> {
      let _ = compile(modname, outname, runtime)
      shellout.exit(0)
    }
    [modname, outname] -> {
      let _ = compile(modname, outname, "deno")
      shellout.exit(0)
    }
    _ -> {
      io.println(help_message)
      shellout.exit(1)
    }
  }
}

fn deploy_glue(modname: String) {
  // mkdir `./dist`
  let dir_name = "dist"
  let dir = simplifile.is_directory(dir_name)

  let code = internal.generate_glue(modname)

  // simplifile.copy_file("./src/glue.js", "./dist/glue.js")
  simplifile.write("./dist/glue.js", code)
}

fn bundle(target: String) {
  let _ =
    esgleam.new("./dist")
    |> esgleam.entry(
      [target, ".gleam"]
      |> string.concat,
    )
    |> esgleam.bundle
}

/// Compile module to single binary.
/// 
/// ```gleam
/// compile("example", "out", "deno")
/// ```
pub fn compile(modname: String, outfile: String, runtime: String) {
  let _ = simplifile.delete(outfile)
  let pwd = case simplifile.current_directory() {
    Ok(path) -> path
    Error(_) -> {
      io.println(
        "Cant get current directory."
        |> ansi.red,
      )
      shellout.exit(1)
      ""
    }
  }

  // Compile and bundle.
  case bundle(modname) {
    Error(_) -> shellout.exit(1)
    _ -> Nil
  }

  deploy_glue(modname)

  // Generate single binary.
  let result = case runtime {
    "bun" -> compile_bun(outfile, pwd)
    "deno" -> compile_deno(outfile, pwd)
    _ -> Error("Missing target runtime")
  }

  case result {
    Ok(_) ->
      io.println(
        "Compile success!"
        |> ansi.cyan,
      )
    Error(_) ->
      io.println(
        "Compile failed."
        |> ansi.red,
      )
  }
}

fn compile_deno(outfile: String, pwd: String) -> Result(String, String) {
  io.println(
    "===== Build on Deno ====="
    |> ansi.cyan,
  )

  case
    shellout.command(
      run: "deno",
      with: ["compile", "-o", outfile, "-A", "./dist/glue.js"],
      in: pwd,
      opt: [shellout.LetBeStdout],
    )
  {
    Ok(val) -> Ok(val)
    Error(val) -> {
      Error("Compile failed.")
    }
  }
}

fn compile_bun(outfile: String, pwd: String) -> Result(String, String) {
  let target_path = filepath.join("dist/", "glue.js")

  io.println(
    "===== Build on Bun ====="
    |> ansi.cyan,
  )

  case
    shellout.command(
      run: "bun",
      with: ["build", target_path, "--compile", "--outfile", outfile],
      in: pwd,
      opt: [shellout.LetBeStdout],
    )
  {
    Ok(val) -> Ok(val)
    Error(_) -> Error("Compile failed.")
  }
}
