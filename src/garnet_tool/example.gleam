// This is example program running on JavaScript runtime.
import gleam/dynamic.{string}
import gleam/fetch
import gleam/http/request
import gleam/io
import gleam/javascript/promise
import gleam/result
import gleam/string
import gleam_community/ansi
import jasper.{Index, Key, Root, String, parse_json, query_json}

pub fn main() {
  let word = "gleam"

  use body <- promise.await(fetch(word))
  let _ =
    result.try(body, fn(body) {
      let mean = parse(body)

      io.println(
        "Gleam mean..."
        |> ansi.yellow,
      )

      io.println(
        mean
        |> ansi.yellow,
      )

      Ok(mean)
    })

  promise.resolve(Ok(Nil))
}

pub fn fetch(word: String) {
  let url =
    ["https://api.dictionaryapi.dev/api/v2/entries/en/", word]
    |> string.concat

  let assert Ok(req) = request.to(url)
  use resp <- promise.try_await(fetch.send(req))
  use resp <- promise.try_await(fetch.read_text_body(resp))

  promise.resolve(Ok(resp.body))
}

fn parse(body: String) {
  let assert Ok(json) = parse_json(body)
  let assert Ok(String(definition)) =
    query_json(
      json,
      Root
        |> Index(0)
        |> Key("meanings")
        |> Index(0)
        |> Key("definitions")
        |> Index(0)
        |> Key("definition"),
    )

  definition
}
