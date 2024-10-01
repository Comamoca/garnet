// This is example program running on JavaScript runtime.
import gleam/dynamic.{string}
import gleam/fetch
import gleam/function
import gleam/http/request
import gleam/io
import gleam/iterator
import gleam/javascript/promise
import gleam/json
import gleam/list
import gleam/result
import gleam/string
import gleam_community/ansi

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
  let assert Ok(dyn) = json.decode(body, dynamic.list(dynamic.dynamic))
  let assert Ok(dyn) = list.first(dyn)
  let assert Ok(dyn) =
    dynamic.field(named: "meanings", of: dynamic.list(dynamic.dynamic))(dyn)
  let assert Ok(dyn) = list.first(dyn)
  let assert Ok(dyn) =
    dynamic.field(named: "definitions", of: dynamic.list(dynamic.dynamic))(dyn)
  let assert Ok(dyn) = list.first(dyn)
  let assert Ok(dyn) = dynamic.field(named: "definition", of: string)(dyn)
  dyn
}
