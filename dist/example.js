// build/dev/javascript/prelude.mjs
var CustomType = class {
  withFields(fields) {
    let properties = Object.keys(this).map(
      (label) => label in fields ? fields[label] : this[label]
    );
    return new this.constructor(...properties);
  }
};
var List = class {
  static fromArray(array2, tail) {
    let t = tail || new Empty();
    for (let i = array2.length - 1; i >= 0; --i) {
      t = new NonEmpty(array2[i], t);
    }
    return t;
  }
  [Symbol.iterator]() {
    return new ListIterator(this);
  }
  toArray() {
    return [...this];
  }
  // @internal
  atLeastLength(desired) {
    for (let _ of this) {
      if (desired <= 0)
        return true;
      desired--;
    }
    return desired <= 0;
  }
  // @internal
  hasLength(desired) {
    for (let _ of this) {
      if (desired <= 0)
        return false;
      desired--;
    }
    return desired === 0;
  }
  countLength() {
    let length4 = 0;
    for (let _ of this)
      length4++;
    return length4;
  }
};
function prepend(element, tail) {
  return new NonEmpty(element, tail);
}
function toList(elements, tail) {
  return List.fromArray(elements, tail);
}
var ListIterator = class {
  #current;
  constructor(current) {
    this.#current = current;
  }
  next() {
    if (this.#current instanceof Empty) {
      return { done: true };
    } else {
      let { head, tail } = this.#current;
      this.#current = tail;
      return { value: head, done: false };
    }
  }
};
var Empty = class extends List {
};
var NonEmpty = class extends List {
  constructor(head, tail) {
    super();
    this.head = head;
    this.tail = tail;
  }
};
var BitArray = class _BitArray {
  constructor(buffer) {
    if (!(buffer instanceof Uint8Array)) {
      throw "BitArray can only be constructed from a Uint8Array";
    }
    this.buffer = buffer;
  }
  // @internal
  get length() {
    return this.buffer.length;
  }
  // @internal
  byteAt(index3) {
    return this.buffer[index3];
  }
  // @internal
  floatAt(index3) {
    return byteArrayToFloat(this.buffer.slice(index3, index3 + 8));
  }
  // @internal
  intFromSlice(start, end) {
    return byteArrayToInt(this.buffer.slice(start, end));
  }
  // @internal
  binaryFromSlice(start, end) {
    return new _BitArray(this.buffer.slice(start, end));
  }
  // @internal
  sliceAfter(index3) {
    return new _BitArray(this.buffer.slice(index3));
  }
};
var UtfCodepoint = class {
  constructor(value) {
    this.value = value;
  }
};
function byteArrayToInt(byteArray) {
  byteArray = byteArray.reverse();
  let value = 0;
  for (let i = byteArray.length - 1; i >= 0; i--) {
    value = value * 256 + byteArray[i];
  }
  return value;
}
function byteArrayToFloat(byteArray) {
  return new Float64Array(byteArray.reverse().buffer)[0];
}
var Result = class _Result extends CustomType {
  // @internal
  static isResult(data) {
    return data instanceof _Result;
  }
};
var Ok = class extends Result {
  constructor(value) {
    super();
    this[0] = value;
  }
  // @internal
  isOk() {
    return true;
  }
};
var Error = class extends Result {
  constructor(detail) {
    super();
    this[0] = detail;
  }
  // @internal
  isOk() {
    return false;
  }
};
function isEqual(x, y) {
  let values2 = [x, y];
  while (values2.length) {
    let a = values2.pop();
    let b = values2.pop();
    if (a === b)
      continue;
    if (!isObject(a) || !isObject(b))
      return false;
    let unequal = !structurallyCompatibleObjects(a, b) || unequalDates(a, b) || unequalBuffers(a, b) || unequalArrays(a, b) || unequalMaps(a, b) || unequalSets(a, b) || unequalRegExps(a, b);
    if (unequal)
      return false;
    const proto = Object.getPrototypeOf(a);
    if (proto !== null && typeof proto.equals === "function") {
      try {
        if (a.equals(b))
          continue;
        else
          return false;
      } catch {
      }
    }
    let [keys, get3] = getters(a);
    for (let k of keys(a)) {
      values2.push(get3(a, k), get3(b, k));
    }
  }
  return true;
}
function getters(object3) {
  if (object3 instanceof Map) {
    return [(x) => x.keys(), (x, y) => x.get(y)];
  } else {
    let extra = object3 instanceof globalThis.Error ? ["message"] : [];
    return [(x) => [...extra, ...Object.keys(x)], (x, y) => x[y]];
  }
}
function unequalDates(a, b) {
  return a instanceof Date && (a > b || a < b);
}
function unequalBuffers(a, b) {
  return a.buffer instanceof ArrayBuffer && a.BYTES_PER_ELEMENT && !(a.byteLength === b.byteLength && a.every((n, i) => n === b[i]));
}
function unequalArrays(a, b) {
  return Array.isArray(a) && a.length !== b.length;
}
function unequalMaps(a, b) {
  return a instanceof Map && a.size !== b.size;
}
function unequalSets(a, b) {
  return a instanceof Set && (a.size != b.size || [...a].some((e) => !b.has(e)));
}
function unequalRegExps(a, b) {
  return a instanceof RegExp && (a.source !== b.source || a.flags !== b.flags);
}
function isObject(a) {
  return typeof a === "object" && a !== null;
}
function structurallyCompatibleObjects(a, b) {
  if (typeof a !== "object" && typeof b !== "object" && (!a || !b))
    return false;
  let nonstructural = [Promise, WeakSet, WeakMap, Function];
  if (nonstructural.some((c) => a instanceof c))
    return false;
  return a.constructor === b.constructor;
}
function makeError(variant, module, line, fn, message, extra) {
  let error = new globalThis.Error(message);
  error.gleam_error = variant;
  error.module = module;
  error.line = line;
  error.fn = fn;
  for (let k in extra)
    error[k] = extra[k];
  return error;
}

// build/dev/javascript/gleam_stdlib/gleam/option.mjs
var Some = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var None = class extends CustomType {
};
function to_result(option, e) {
  if (option instanceof Some) {
    let a = option[0];
    return new Ok(a);
  } else {
    return new Error(e);
  }
}
function from_result(result) {
  if (result.isOk()) {
    let a = result[0];
    return new Some(a);
  } else {
    return new None();
  }
}
function unwrap(option, default$) {
  if (option instanceof Some) {
    let x = option[0];
    return x;
  } else {
    return default$;
  }
}
function map(option, fun) {
  if (option instanceof Some) {
    let x = option[0];
    return new Some(fun(x));
  } else {
    return new None();
  }
}

// build/dev/javascript/gleam_stdlib/gleam/regex.mjs
var Match = class extends CustomType {
  constructor(content, submatches) {
    super();
    this.content = content;
    this.submatches = submatches;
  }
};
var CompileError = class extends CustomType {
  constructor(error, byte_index) {
    super();
    this.error = error;
    this.byte_index = byte_index;
  }
};
var Options = class extends CustomType {
  constructor(case_insensitive, multi_line) {
    super();
    this.case_insensitive = case_insensitive;
    this.multi_line = multi_line;
  }
};
function compile(pattern, options) {
  return compile_regex(pattern, options);
}
function scan(regex, string3) {
  return regex_scan(regex, string3);
}

// build/dev/javascript/gleam_stdlib/gleam/float.mjs
function parse(string3) {
  return parse_float(string3);
}

// build/dev/javascript/gleam_stdlib/gleam/int.mjs
function parse2(string3) {
  return parse_int(string3);
}
function base_parse(string3, base) {
  let $ = base >= 2 && base <= 36;
  if ($) {
    return int_from_base_string(string3, base);
  } else {
    return new Error(void 0);
  }
}
function to_string2(x) {
  return to_string(x);
}

// build/dev/javascript/gleam_stdlib/gleam/pair.mjs
function second(pair2) {
  let a = pair2[1];
  return a;
}

// build/dev/javascript/gleam_stdlib/gleam/list.mjs
function count_length(loop$list, loop$count) {
  while (true) {
    let list = loop$list;
    let count = loop$count;
    if (list.atLeastLength(1)) {
      let list$1 = list.tail;
      loop$list = list$1;
      loop$count = count + 1;
    } else {
      return count;
    }
  }
}
function length(list) {
  return count_length(list, 0);
}
function do_reverse(loop$remaining, loop$accumulator) {
  while (true) {
    let remaining = loop$remaining;
    let accumulator = loop$accumulator;
    if (remaining.hasLength(0)) {
      return accumulator;
    } else {
      let item = remaining.head;
      let rest$1 = remaining.tail;
      loop$remaining = rest$1;
      loop$accumulator = prepend(item, accumulator);
    }
  }
}
function reverse(xs) {
  return do_reverse(xs, toList([]));
}
function contains(loop$list, loop$elem) {
  while (true) {
    let list = loop$list;
    let elem = loop$elem;
    if (list.hasLength(0)) {
      return false;
    } else if (list.atLeastLength(1) && isEqual(list.head, elem)) {
      let first$1 = list.head;
      return true;
    } else {
      let rest$1 = list.tail;
      loop$list = rest$1;
      loop$elem = elem;
    }
  }
}
function first(list) {
  if (list.hasLength(0)) {
    return new Error(void 0);
  } else {
    let x = list.head;
    return new Ok(x);
  }
}
function do_filter(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list.hasLength(0)) {
      return reverse(acc);
    } else {
      let x = list.head;
      let xs = list.tail;
      let new_acc = (() => {
        let $ = fun(x);
        if ($) {
          return prepend(x, acc);
        } else {
          return acc;
        }
      })();
      loop$list = xs;
      loop$fun = fun;
      loop$acc = new_acc;
    }
  }
}
function filter(list, predicate) {
  return do_filter(list, predicate, toList([]));
}
function do_filter_map(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list.hasLength(0)) {
      return reverse(acc);
    } else {
      let x = list.head;
      let xs = list.tail;
      let new_acc = (() => {
        let $ = fun(x);
        if ($.isOk()) {
          let x$1 = $[0];
          return prepend(x$1, acc);
        } else {
          return acc;
        }
      })();
      loop$list = xs;
      loop$fun = fun;
      loop$acc = new_acc;
    }
  }
}
function filter_map(list, fun) {
  return do_filter_map(list, fun, toList([]));
}
function do_map(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list.hasLength(0)) {
      return reverse(acc);
    } else {
      let x = list.head;
      let xs = list.tail;
      loop$list = xs;
      loop$fun = fun;
      loop$acc = prepend(fun(x), acc);
    }
  }
}
function map2(list, fun) {
  return do_map(list, fun, toList([]));
}
function do_try_map(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list.hasLength(0)) {
      return new Ok(reverse(acc));
    } else {
      let x = list.head;
      let xs = list.tail;
      let $ = fun(x);
      if ($.isOk()) {
        let y = $[0];
        loop$list = xs;
        loop$fun = fun;
        loop$acc = prepend(y, acc);
      } else {
        let error = $[0];
        return new Error(error);
      }
    }
  }
}
function try_map(list, fun) {
  return do_try_map(list, fun, toList([]));
}
function drop(loop$list, loop$n) {
  while (true) {
    let list = loop$list;
    let n = loop$n;
    let $ = n <= 0;
    if ($) {
      return list;
    } else {
      if (list.hasLength(0)) {
        return toList([]);
      } else {
        let xs = list.tail;
        loop$list = xs;
        loop$n = n - 1;
      }
    }
  }
}
function do_take(loop$list, loop$n, loop$acc) {
  while (true) {
    let list = loop$list;
    let n = loop$n;
    let acc = loop$acc;
    let $ = n <= 0;
    if ($) {
      return reverse(acc);
    } else {
      if (list.hasLength(0)) {
        return reverse(acc);
      } else {
        let x = list.head;
        let xs = list.tail;
        loop$list = xs;
        loop$n = n - 1;
        loop$acc = prepend(x, acc);
      }
    }
  }
}
function take(list, n) {
  return do_take(list, n, toList([]));
}
function do_append(loop$first, loop$second) {
  while (true) {
    let first2 = loop$first;
    let second2 = loop$second;
    if (first2.hasLength(0)) {
      return second2;
    } else {
      let item = first2.head;
      let rest$1 = first2.tail;
      loop$first = rest$1;
      loop$second = prepend(item, second2);
    }
  }
}
function append(first2, second2) {
  return do_append(reverse(first2), second2);
}
function reverse_and_prepend(loop$prefix, loop$suffix) {
  while (true) {
    let prefix = loop$prefix;
    let suffix = loop$suffix;
    if (prefix.hasLength(0)) {
      return suffix;
    } else {
      let first$1 = prefix.head;
      let rest$1 = prefix.tail;
      loop$prefix = rest$1;
      loop$suffix = prepend(first$1, suffix);
    }
  }
}
function do_concat(loop$lists, loop$acc) {
  while (true) {
    let lists = loop$lists;
    let acc = loop$acc;
    if (lists.hasLength(0)) {
      return reverse(acc);
    } else {
      let list = lists.head;
      let further_lists = lists.tail;
      loop$lists = further_lists;
      loop$acc = reverse_and_prepend(list, acc);
    }
  }
}
function concat(lists) {
  return do_concat(lists, toList([]));
}
function at(list, index3) {
  let $ = index3 >= 0;
  if ($) {
    let _pipe = list;
    let _pipe$1 = drop(_pipe, index3);
    return first(_pipe$1);
  } else {
    return new Error(void 0);
  }
}
function do_repeat(loop$a, loop$times, loop$acc) {
  while (true) {
    let a = loop$a;
    let times = loop$times;
    let acc = loop$acc;
    let $ = times <= 0;
    if ($) {
      return acc;
    } else {
      loop$a = a;
      loop$times = times - 1;
      loop$acc = prepend(a, acc);
    }
  }
}
function repeat(a, times) {
  return do_repeat(a, times, toList([]));
}

// build/dev/javascript/gleam_stdlib/gleam/result.mjs
function map3(result, fun) {
  if (result.isOk()) {
    let x = result[0];
    return new Ok(fun(x));
  } else {
    let e = result[0];
    return new Error(e);
  }
}
function map_error(result, fun) {
  if (result.isOk()) {
    let x = result[0];
    return new Ok(x);
  } else {
    let error = result[0];
    return new Error(fun(error));
  }
}
function flatten(result) {
  if (result.isOk()) {
    let x = result[0];
    return x;
  } else {
    let error = result[0];
    return new Error(error);
  }
}
function try$(result, fun) {
  if (result.isOk()) {
    let x = result[0];
    return fun(x);
  } else {
    let e = result[0];
    return new Error(e);
  }
}
function then$(result, fun) {
  return try$(result, fun);
}
function unwrap2(result, default$) {
  if (result.isOk()) {
    let v = result[0];
    return v;
  } else {
    return default$;
  }
}
function nil_error(result) {
  return map_error(result, (_) => {
    return void 0;
  });
}
function all(results) {
  return try_map(results, (x) => {
    return x;
  });
}
function replace_error(result, error) {
  if (result.isOk()) {
    let x = result[0];
    return new Ok(x);
  } else {
    return new Error(error);
  }
}
function values(results) {
  return filter_map(results, (r) => {
    return r;
  });
}

// build/dev/javascript/gleam_stdlib/gleam/string_builder.mjs
function from_strings(strings) {
  return concat2(strings);
}
function from_string(string3) {
  return identity(string3);
}
function to_string3(builder) {
  return identity(builder);
}

// build/dev/javascript/gleam_stdlib/dict.mjs
var referenceMap = /* @__PURE__ */ new WeakMap();
var tempDataView = new DataView(new ArrayBuffer(8));
var referenceUID = 0;
function hashByReference(o) {
  const known = referenceMap.get(o);
  if (known !== void 0) {
    return known;
  }
  const hash = referenceUID++;
  if (referenceUID === 2147483647) {
    referenceUID = 0;
  }
  referenceMap.set(o, hash);
  return hash;
}
function hashMerge(a, b) {
  return a ^ b + 2654435769 + (a << 6) + (a >> 2) | 0;
}
function hashString(s) {
  let hash = 0;
  const len = s.length;
  for (let i = 0; i < len; i++) {
    hash = Math.imul(31, hash) + s.charCodeAt(i) | 0;
  }
  return hash;
}
function hashNumber(n) {
  tempDataView.setFloat64(0, n);
  const i = tempDataView.getInt32(0);
  const j = tempDataView.getInt32(4);
  return Math.imul(73244475, i >> 16 ^ i) ^ j;
}
function hashBigInt(n) {
  return hashString(n.toString());
}
function hashObject(o) {
  const proto = Object.getPrototypeOf(o);
  if (proto !== null && typeof proto.hashCode === "function") {
    try {
      const code2 = o.hashCode(o);
      if (typeof code2 === "number") {
        return code2;
      }
    } catch {
    }
  }
  if (o instanceof Promise || o instanceof WeakSet || o instanceof WeakMap) {
    return hashByReference(o);
  }
  if (o instanceof Date) {
    return hashNumber(o.getTime());
  }
  let h = 0;
  if (o instanceof ArrayBuffer) {
    o = new Uint8Array(o);
  }
  if (Array.isArray(o) || o instanceof Uint8Array) {
    for (let i = 0; i < o.length; i++) {
      h = Math.imul(31, h) + getHash(o[i]) | 0;
    }
  } else if (o instanceof Set) {
    o.forEach((v) => {
      h = h + getHash(v) | 0;
    });
  } else if (o instanceof Map) {
    o.forEach((v, k) => {
      h = h + hashMerge(getHash(v), getHash(k)) | 0;
    });
  } else {
    const keys = Object.keys(o);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const v = o[k];
      h = h + hashMerge(getHash(v), hashString(k)) | 0;
    }
  }
  return h;
}
function getHash(u) {
  if (u === null)
    return 1108378658;
  if (u === void 0)
    return 1108378659;
  if (u === true)
    return 1108378657;
  if (u === false)
    return 1108378656;
  switch (typeof u) {
    case "number":
      return hashNumber(u);
    case "string":
      return hashString(u);
    case "bigint":
      return hashBigInt(u);
    case "object":
      return hashObject(u);
    case "symbol":
      return hashByReference(u);
    case "function":
      return hashByReference(u);
    default:
      return 0;
  }
}
var SHIFT = 5;
var BUCKET_SIZE = Math.pow(2, SHIFT);
var MASK = BUCKET_SIZE - 1;
var MAX_INDEX_NODE = BUCKET_SIZE / 2;
var MIN_ARRAY_NODE = BUCKET_SIZE / 4;
var ENTRY = 0;
var ARRAY_NODE = 1;
var INDEX_NODE = 2;
var COLLISION_NODE = 3;
var EMPTY = {
  type: INDEX_NODE,
  bitmap: 0,
  array: []
};
function mask(hash, shift) {
  return hash >>> shift & MASK;
}
function bitpos(hash, shift) {
  return 1 << mask(hash, shift);
}
function bitcount(x) {
  x -= x >> 1 & 1431655765;
  x = (x & 858993459) + (x >> 2 & 858993459);
  x = x + (x >> 4) & 252645135;
  x += x >> 8;
  x += x >> 16;
  return x & 127;
}
function index(bitmap, bit) {
  return bitcount(bitmap & bit - 1);
}
function cloneAndSet(arr, at2, val) {
  const len = arr.length;
  const out = new Array(len);
  for (let i = 0; i < len; ++i) {
    out[i] = arr[i];
  }
  out[at2] = val;
  return out;
}
function spliceIn(arr, at2, val) {
  const len = arr.length;
  const out = new Array(len + 1);
  let i = 0;
  let g = 0;
  while (i < at2) {
    out[g++] = arr[i++];
  }
  out[g++] = val;
  while (i < len) {
    out[g++] = arr[i++];
  }
  return out;
}
function spliceOut(arr, at2) {
  const len = arr.length;
  const out = new Array(len - 1);
  let i = 0;
  let g = 0;
  while (i < at2) {
    out[g++] = arr[i++];
  }
  ++i;
  while (i < len) {
    out[g++] = arr[i++];
  }
  return out;
}
function createNode(shift, key1, val1, key2hash, key2, val2) {
  const key1hash = getHash(key1);
  if (key1hash === key2hash) {
    return {
      type: COLLISION_NODE,
      hash: key1hash,
      array: [
        { type: ENTRY, k: key1, v: val1 },
        { type: ENTRY, k: key2, v: val2 }
      ]
    };
  }
  const addedLeaf = { val: false };
  return assoc(
    assocIndex(EMPTY, shift, key1hash, key1, val1, addedLeaf),
    shift,
    key2hash,
    key2,
    val2,
    addedLeaf
  );
}
function assoc(root, shift, hash, key, val, addedLeaf) {
  switch (root.type) {
    case ARRAY_NODE:
      return assocArray(root, shift, hash, key, val, addedLeaf);
    case INDEX_NODE:
      return assocIndex(root, shift, hash, key, val, addedLeaf);
    case COLLISION_NODE:
      return assocCollision(root, shift, hash, key, val, addedLeaf);
  }
}
function assocArray(root, shift, hash, key, val, addedLeaf) {
  const idx = mask(hash, shift);
  const node = root.array[idx];
  if (node === void 0) {
    addedLeaf.val = true;
    return {
      type: ARRAY_NODE,
      size: root.size + 1,
      array: cloneAndSet(root.array, idx, { type: ENTRY, k: key, v: val })
    };
  }
  if (node.type === ENTRY) {
    if (isEqual(key, node.k)) {
      if (val === node.v) {
        return root;
      }
      return {
        type: ARRAY_NODE,
        size: root.size,
        array: cloneAndSet(root.array, idx, {
          type: ENTRY,
          k: key,
          v: val
        })
      };
    }
    addedLeaf.val = true;
    return {
      type: ARRAY_NODE,
      size: root.size,
      array: cloneAndSet(
        root.array,
        idx,
        createNode(shift + SHIFT, node.k, node.v, hash, key, val)
      )
    };
  }
  const n = assoc(node, shift + SHIFT, hash, key, val, addedLeaf);
  if (n === node) {
    return root;
  }
  return {
    type: ARRAY_NODE,
    size: root.size,
    array: cloneAndSet(root.array, idx, n)
  };
}
function assocIndex(root, shift, hash, key, val, addedLeaf) {
  const bit = bitpos(hash, shift);
  const idx = index(root.bitmap, bit);
  if ((root.bitmap & bit) !== 0) {
    const node = root.array[idx];
    if (node.type !== ENTRY) {
      const n = assoc(node, shift + SHIFT, hash, key, val, addedLeaf);
      if (n === node) {
        return root;
      }
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap,
        array: cloneAndSet(root.array, idx, n)
      };
    }
    const nodeKey = node.k;
    if (isEqual(key, nodeKey)) {
      if (val === node.v) {
        return root;
      }
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap,
        array: cloneAndSet(root.array, idx, {
          type: ENTRY,
          k: key,
          v: val
        })
      };
    }
    addedLeaf.val = true;
    return {
      type: INDEX_NODE,
      bitmap: root.bitmap,
      array: cloneAndSet(
        root.array,
        idx,
        createNode(shift + SHIFT, nodeKey, node.v, hash, key, val)
      )
    };
  } else {
    const n = root.array.length;
    if (n >= MAX_INDEX_NODE) {
      const nodes = new Array(32);
      const jdx = mask(hash, shift);
      nodes[jdx] = assocIndex(EMPTY, shift + SHIFT, hash, key, val, addedLeaf);
      let j = 0;
      let bitmap = root.bitmap;
      for (let i = 0; i < 32; i++) {
        if ((bitmap & 1) !== 0) {
          const node = root.array[j++];
          nodes[i] = node;
        }
        bitmap = bitmap >>> 1;
      }
      return {
        type: ARRAY_NODE,
        size: n + 1,
        array: nodes
      };
    } else {
      const newArray = spliceIn(root.array, idx, {
        type: ENTRY,
        k: key,
        v: val
      });
      addedLeaf.val = true;
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap | bit,
        array: newArray
      };
    }
  }
}
function assocCollision(root, shift, hash, key, val, addedLeaf) {
  if (hash === root.hash) {
    const idx = collisionIndexOf(root, key);
    if (idx !== -1) {
      const entry = root.array[idx];
      if (entry.v === val) {
        return root;
      }
      return {
        type: COLLISION_NODE,
        hash,
        array: cloneAndSet(root.array, idx, { type: ENTRY, k: key, v: val })
      };
    }
    const size = root.array.length;
    addedLeaf.val = true;
    return {
      type: COLLISION_NODE,
      hash,
      array: cloneAndSet(root.array, size, { type: ENTRY, k: key, v: val })
    };
  }
  return assoc(
    {
      type: INDEX_NODE,
      bitmap: bitpos(root.hash, shift),
      array: [root]
    },
    shift,
    hash,
    key,
    val,
    addedLeaf
  );
}
function collisionIndexOf(root, key) {
  const size = root.array.length;
  for (let i = 0; i < size; i++) {
    if (isEqual(key, root.array[i].k)) {
      return i;
    }
  }
  return -1;
}
function find(root, shift, hash, key) {
  switch (root.type) {
    case ARRAY_NODE:
      return findArray(root, shift, hash, key);
    case INDEX_NODE:
      return findIndex(root, shift, hash, key);
    case COLLISION_NODE:
      return findCollision(root, key);
  }
}
function findArray(root, shift, hash, key) {
  const idx = mask(hash, shift);
  const node = root.array[idx];
  if (node === void 0) {
    return void 0;
  }
  if (node.type !== ENTRY) {
    return find(node, shift + SHIFT, hash, key);
  }
  if (isEqual(key, node.k)) {
    return node;
  }
  return void 0;
}
function findIndex(root, shift, hash, key) {
  const bit = bitpos(hash, shift);
  if ((root.bitmap & bit) === 0) {
    return void 0;
  }
  const idx = index(root.bitmap, bit);
  const node = root.array[idx];
  if (node.type !== ENTRY) {
    return find(node, shift + SHIFT, hash, key);
  }
  if (isEqual(key, node.k)) {
    return node;
  }
  return void 0;
}
function findCollision(root, key) {
  const idx = collisionIndexOf(root, key);
  if (idx < 0) {
    return void 0;
  }
  return root.array[idx];
}
function without(root, shift, hash, key) {
  switch (root.type) {
    case ARRAY_NODE:
      return withoutArray(root, shift, hash, key);
    case INDEX_NODE:
      return withoutIndex(root, shift, hash, key);
    case COLLISION_NODE:
      return withoutCollision(root, key);
  }
}
function withoutArray(root, shift, hash, key) {
  const idx = mask(hash, shift);
  const node = root.array[idx];
  if (node === void 0) {
    return root;
  }
  let n = void 0;
  if (node.type === ENTRY) {
    if (!isEqual(node.k, key)) {
      return root;
    }
  } else {
    n = without(node, shift + SHIFT, hash, key);
    if (n === node) {
      return root;
    }
  }
  if (n === void 0) {
    if (root.size <= MIN_ARRAY_NODE) {
      const arr = root.array;
      const out = new Array(root.size - 1);
      let i = 0;
      let j = 0;
      let bitmap = 0;
      while (i < idx) {
        const nv = arr[i];
        if (nv !== void 0) {
          out[j] = nv;
          bitmap |= 1 << i;
          ++j;
        }
        ++i;
      }
      ++i;
      while (i < arr.length) {
        const nv = arr[i];
        if (nv !== void 0) {
          out[j] = nv;
          bitmap |= 1 << i;
          ++j;
        }
        ++i;
      }
      return {
        type: INDEX_NODE,
        bitmap,
        array: out
      };
    }
    return {
      type: ARRAY_NODE,
      size: root.size - 1,
      array: cloneAndSet(root.array, idx, n)
    };
  }
  return {
    type: ARRAY_NODE,
    size: root.size,
    array: cloneAndSet(root.array, idx, n)
  };
}
function withoutIndex(root, shift, hash, key) {
  const bit = bitpos(hash, shift);
  if ((root.bitmap & bit) === 0) {
    return root;
  }
  const idx = index(root.bitmap, bit);
  const node = root.array[idx];
  if (node.type !== ENTRY) {
    const n = without(node, shift + SHIFT, hash, key);
    if (n === node) {
      return root;
    }
    if (n !== void 0) {
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap,
        array: cloneAndSet(root.array, idx, n)
      };
    }
    if (root.bitmap === bit) {
      return void 0;
    }
    return {
      type: INDEX_NODE,
      bitmap: root.bitmap ^ bit,
      array: spliceOut(root.array, idx)
    };
  }
  if (isEqual(key, node.k)) {
    if (root.bitmap === bit) {
      return void 0;
    }
    return {
      type: INDEX_NODE,
      bitmap: root.bitmap ^ bit,
      array: spliceOut(root.array, idx)
    };
  }
  return root;
}
function withoutCollision(root, key) {
  const idx = collisionIndexOf(root, key);
  if (idx < 0) {
    return root;
  }
  if (root.array.length === 1) {
    return void 0;
  }
  return {
    type: COLLISION_NODE,
    hash: root.hash,
    array: spliceOut(root.array, idx)
  };
}
function forEach(root, fn) {
  if (root === void 0) {
    return;
  }
  const items = root.array;
  const size = items.length;
  for (let i = 0; i < size; i++) {
    const item = items[i];
    if (item === void 0) {
      continue;
    }
    if (item.type === ENTRY) {
      fn(item.v, item.k);
      continue;
    }
    forEach(item, fn);
  }
}
var Dict = class _Dict {
  /**
   * @template V
   * @param {Record<string,V>} o
   * @returns {Dict<string,V>}
   */
  static fromObject(o) {
    const keys = Object.keys(o);
    let m = _Dict.new();
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      m = m.set(k, o[k]);
    }
    return m;
  }
  /**
   * @template K,V
   * @param {Map<K,V>} o
   * @returns {Dict<K,V>}
   */
  static fromMap(o) {
    let m = _Dict.new();
    o.forEach((v, k) => {
      m = m.set(k, v);
    });
    return m;
  }
  static new() {
    return new _Dict(void 0, 0);
  }
  /**
   * @param {undefined | Node<K,V>} root
   * @param {number} size
   */
  constructor(root, size) {
    this.root = root;
    this.size = size;
  }
  /**
   * @template NotFound
   * @param {K} key
   * @param {NotFound} notFound
   * @returns {NotFound | V}
   */
  get(key, notFound) {
    if (this.root === void 0) {
      return notFound;
    }
    const found = find(this.root, 0, getHash(key), key);
    if (found === void 0) {
      return notFound;
    }
    return found.v;
  }
  /**
   * @param {K} key
   * @param {V} val
   * @returns {Dict<K,V>}
   */
  set(key, val) {
    const addedLeaf = { val: false };
    const root = this.root === void 0 ? EMPTY : this.root;
    const newRoot = assoc(root, 0, getHash(key), key, val, addedLeaf);
    if (newRoot === this.root) {
      return this;
    }
    return new _Dict(newRoot, addedLeaf.val ? this.size + 1 : this.size);
  }
  /**
   * @param {K} key
   * @returns {Dict<K,V>}
   */
  delete(key) {
    if (this.root === void 0) {
      return this;
    }
    const newRoot = without(this.root, 0, getHash(key), key);
    if (newRoot === this.root) {
      return this;
    }
    if (newRoot === void 0) {
      return _Dict.new();
    }
    return new _Dict(newRoot, this.size - 1);
  }
  /**
   * @param {K} key
   * @returns {boolean}
   */
  has(key) {
    if (this.root === void 0) {
      return false;
    }
    return find(this.root, 0, getHash(key), key) !== void 0;
  }
  /**
   * @returns {[K,V][]}
   */
  entries() {
    if (this.root === void 0) {
      return [];
    }
    const result = [];
    this.forEach((v, k) => result.push([k, v]));
    return result;
  }
  /**
   *
   * @param {(val:V,key:K)=>void} fn
   */
  forEach(fn) {
    forEach(this.root, fn);
  }
  hashCode() {
    let h = 0;
    this.forEach((v, k) => {
      h = h + hashMerge(getHash(v), getHash(k)) | 0;
    });
    return h;
  }
  /**
   * @param {unknown} o
   * @returns {boolean}
   */
  equals(o) {
    if (!(o instanceof _Dict) || this.size !== o.size) {
      return false;
    }
    let equal = true;
    this.forEach((v, k) => {
      equal = equal && isEqual(o.get(k, !v), v);
    });
    return equal;
  }
};

// build/dev/javascript/gleam_stdlib/gleam_stdlib.mjs
var Nil = void 0;
var NOT_FOUND = {};
function identity(x) {
  return x;
}
function parse_int(value) {
  if (/^[-+]?(\d+)$/.test(value)) {
    return new Ok(parseInt(value));
  } else {
    return new Error(Nil);
  }
}
function parse_float(value) {
  if (/^[-+]?(\d+)\.(\d+)$/.test(value)) {
    return new Ok(parseFloat(value));
  } else {
    return new Error(Nil);
  }
}
function to_string(term) {
  return term.toString();
}
var int_base_patterns = {
  2: /[^0-1]/,
  3: /[^0-2]/,
  4: /[^0-3]/,
  5: /[^0-4]/,
  6: /[^0-5]/,
  7: /[^0-6]/,
  8: /[^0-7]/,
  9: /[^0-8]/,
  10: /[^0-9]/,
  11: /[^0-9a]/,
  12: /[^0-9a-b]/,
  13: /[^0-9a-c]/,
  14: /[^0-9a-d]/,
  15: /[^0-9a-e]/,
  16: /[^0-9a-f]/,
  17: /[^0-9a-g]/,
  18: /[^0-9a-h]/,
  19: /[^0-9a-i]/,
  20: /[^0-9a-j]/,
  21: /[^0-9a-k]/,
  22: /[^0-9a-l]/,
  23: /[^0-9a-m]/,
  24: /[^0-9a-n]/,
  25: /[^0-9a-o]/,
  26: /[^0-9a-p]/,
  27: /[^0-9a-q]/,
  28: /[^0-9a-r]/,
  29: /[^0-9a-s]/,
  30: /[^0-9a-t]/,
  31: /[^0-9a-u]/,
  32: /[^0-9a-v]/,
  33: /[^0-9a-w]/,
  34: /[^0-9a-x]/,
  35: /[^0-9a-y]/,
  36: /[^0-9a-z]/
};
function int_from_base_string(string3, base) {
  if (int_base_patterns[base].test(string3.replace(/^-/, "").toLowerCase())) {
    return new Error(Nil);
  }
  const result = parseInt(string3, base);
  if (isNaN(result)) {
    return new Error(Nil);
  }
  return new Ok(result);
}
function string_replace(string3, target, substitute) {
  if (typeof string3.replaceAll !== "undefined") {
    return string3.replaceAll(target, substitute);
  }
  return string3.replace(
    // $& means the whole matched string
    new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
    substitute
  );
}
function graphemes(string3) {
  const iterator = graphemes_iterator(string3);
  if (iterator) {
    return List.fromArray(Array.from(iterator).map((item) => item.segment));
  } else {
    return List.fromArray(string3.match(/./gsu));
  }
}
function graphemes_iterator(string3) {
  if (Intl && Intl.Segmenter) {
    return new Intl.Segmenter().segment(string3)[Symbol.iterator]();
  }
}
function pop_grapheme(string3) {
  let first2;
  const iterator = graphemes_iterator(string3);
  if (iterator) {
    first2 = iterator.next().value?.segment;
  } else {
    first2 = string3.match(/./su)?.[0];
  }
  if (first2) {
    return new Ok([first2, string3.slice(first2.length)]);
  } else {
    return new Error(Nil);
  }
}
function lowercase(string3) {
  return string3.toLowerCase();
}
function join(xs, separator) {
  const iterator = xs[Symbol.iterator]();
  let result = iterator.next().value || "";
  let current = iterator.next();
  while (!current.done) {
    result = result + separator + current.value;
    current = iterator.next();
  }
  return result;
}
function concat2(xs) {
  let result = "";
  for (const x of xs) {
    result = result + x;
  }
  return result;
}
function starts_with(haystack, needle) {
  return haystack.startsWith(needle);
}
function console_log(term) {
  console.log(term);
}
function codepoint(int) {
  return new UtfCodepoint(int);
}
function utf_codepoint_list_to_string(utf_codepoint_integer_list) {
  return utf_codepoint_integer_list.toArray().map((x) => String.fromCodePoint(x.value)).join("");
}
function compile_regex(pattern, options) {
  try {
    let flags = "gu";
    if (options.case_insensitive)
      flags += "i";
    if (options.multi_line)
      flags += "m";
    return new Ok(new RegExp(pattern, flags));
  } catch (error) {
    const number = (error.columnNumber || 0) | 0;
    return new Error(new CompileError(error.message, number));
  }
}
function regex_scan(regex, string3) {
  const matches = Array.from(string3.matchAll(regex)).map((match) => {
    const content = match[0];
    const submatches = [];
    for (let n = match.length - 1; n > 0; n--) {
      if (match[n]) {
        submatches[n - 1] = new Some(match[n]);
        continue;
      }
      if (submatches.length > 0) {
        submatches[n - 1] = new None();
      }
    }
    return new Match(content, List.fromArray(submatches));
  });
  return List.fromArray(matches);
}
function new_map() {
  return Dict.new();
}
function map_to_list(map6) {
  return List.fromArray(map6.entries());
}
function map_get(map6, key) {
  const value = map6.get(key, NOT_FOUND);
  if (value === NOT_FOUND) {
    return new Error(Nil);
  }
  return new Ok(value);
}
function map_insert(key, value, map6) {
  return map6.set(key, value);
}
function inspect(v) {
  const t = typeof v;
  if (v === true)
    return "True";
  if (v === false)
    return "False";
  if (v === null)
    return "//js(null)";
  if (v === void 0)
    return "Nil";
  if (t === "string")
    return JSON.stringify(v);
  if (t === "bigint" || t === "number")
    return v.toString();
  if (Array.isArray(v))
    return `#(${v.map(inspect).join(", ")})`;
  if (v instanceof List)
    return inspectList(v);
  if (v instanceof UtfCodepoint)
    return inspectUtfCodepoint(v);
  if (v instanceof BitArray)
    return inspectBitArray(v);
  if (v instanceof CustomType)
    return inspectCustomType(v);
  if (v instanceof Dict)
    return inspectDict(v);
  if (v instanceof Set)
    return `//js(Set(${[...v].map(inspect).join(", ")}))`;
  if (v instanceof RegExp)
    return `//js(${v})`;
  if (v instanceof Date)
    return `//js(Date("${v.toISOString()}"))`;
  if (v instanceof Function) {
    const args = [];
    for (const i of Array(v.length).keys())
      args.push(String.fromCharCode(i + 97));
    return `//fn(${args.join(", ")}) { ... }`;
  }
  return inspectObject(v);
}
function inspectDict(map6) {
  let body = "dict.from_list([";
  let first2 = true;
  map6.forEach((value, key) => {
    if (!first2)
      body = body + ", ";
    body = body + "#(" + inspect(key) + ", " + inspect(value) + ")";
    first2 = false;
  });
  return body + "])";
}
function inspectObject(v) {
  const name = Object.getPrototypeOf(v)?.constructor?.name || "Object";
  const props = [];
  for (const k of Object.keys(v)) {
    props.push(`${inspect(k)}: ${inspect(v[k])}`);
  }
  const body = props.length ? " " + props.join(", ") + " " : "";
  const head = name === "Object" ? "" : name + " ";
  return `//js(${head}{${body}})`;
}
function inspectCustomType(record) {
  const props = Object.keys(record).map((label) => {
    const value = inspect(record[label]);
    return isNaN(parseInt(label)) ? `${label}: ${value}` : value;
  }).join(", ");
  return props ? `${record.constructor.name}(${props})` : record.constructor.name;
}
function inspectList(list) {
  return `[${list.toArray().map(inspect).join(", ")}]`;
}
function inspectBitArray(bits) {
  return `<<${Array.from(bits.buffer).join(", ")}>>`;
}
function inspectUtfCodepoint(codepoint2) {
  return `//utfcodepoint(${String.fromCodePoint(codepoint2.value)})`;
}

// build/dev/javascript/gleam_stdlib/gleam/dict.mjs
function new$() {
  return new_map();
}
function get(from, get3) {
  return map_get(from, get3);
}
function insert(dict, key, value) {
  return map_insert(key, value, dict);
}
function fold_list_of_pair(loop$list, loop$initial) {
  while (true) {
    let list = loop$list;
    let initial = loop$initial;
    if (list.hasLength(0)) {
      return initial;
    } else {
      let x = list.head;
      let rest = list.tail;
      loop$list = rest;
      loop$initial = insert(initial, x[0], x[1]);
    }
  }
}
function from_list(list) {
  return fold_list_of_pair(list, new$());
}
function do_fold(loop$list, loop$initial, loop$fun) {
  while (true) {
    let list = loop$list;
    let initial = loop$initial;
    let fun = loop$fun;
    if (list.hasLength(0)) {
      return initial;
    } else {
      let k = list.head[0];
      let v = list.head[1];
      let rest = list.tail;
      loop$list = rest;
      loop$initial = fun(initial, k, v);
      loop$fun = fun;
    }
  }
}
function fold(dict, initial, fun) {
  let _pipe = dict;
  let _pipe$1 = map_to_list(_pipe);
  return do_fold(_pipe$1, initial, fun);
}
function do_map_values(f, dict) {
  let f$1 = (dict2, k, v) => {
    return insert(dict2, k, f(k, v));
  };
  let _pipe = dict;
  return fold(_pipe, new$(), f$1);
}
function map_values(dict, fun) {
  return do_map_values(fun, dict);
}

// build/dev/javascript/gleam_stdlib/gleam/string.mjs
function replace(string3, pattern, substitute) {
  let _pipe = string3;
  let _pipe$1 = from_string(_pipe);
  let _pipe$2 = string_replace(_pipe$1, pattern, substitute);
  return to_string3(_pipe$2);
}
function lowercase2(string3) {
  return lowercase(string3);
}
function starts_with2(string3, prefix) {
  return starts_with(string3, prefix);
}
function concat3(strings) {
  let _pipe = strings;
  let _pipe$1 = from_strings(_pipe);
  return to_string3(_pipe$1);
}
function join2(strings, separator) {
  return join(strings, separator);
}
function pop_grapheme2(string3) {
  return pop_grapheme(string3);
}
function utf_codepoint(value) {
  if (value > 1114111) {
    let i = value;
    return new Error(void 0);
  } else if (value === 65534) {
    return new Error(void 0);
  } else if (value === 65535) {
    return new Error(void 0);
  } else if (value >= 55296 && value <= 57343) {
    let i = value;
    return new Error(void 0);
  } else {
    let i = value;
    return new Ok(codepoint(i));
  }
}
function inspect2(term) {
  let _pipe = inspect(term);
  return to_string3(_pipe);
}

// build/dev/javascript/gleam_community_colour/gleam_community/colour.mjs
var Rgba = class extends CustomType {
  constructor(r, g, b, a) {
    super();
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
};
var light_red = new Rgba(
  0.9372549019607843,
  0.1607843137254902,
  0.1607843137254902,
  1
);
var red = new Rgba(0.8, 0, 0, 1);
var dark_red = new Rgba(0.6431372549019608, 0, 0, 1);
var light_orange = new Rgba(
  0.9882352941176471,
  0.6862745098039216,
  0.24313725490196078,
  1
);
var orange = new Rgba(0.9607843137254902, 0.4745098039215686, 0, 1);
var dark_orange = new Rgba(
  0.807843137254902,
  0.3607843137254902,
  0,
  1
);
var light_yellow = new Rgba(
  1,
  0.9137254901960784,
  0.30980392156862746,
  1
);
var yellow = new Rgba(0.9294117647058824, 0.8313725490196079, 0, 1);
var dark_yellow = new Rgba(
  0.7686274509803922,
  0.6274509803921569,
  0,
  1
);
var light_green = new Rgba(
  0.5411764705882353,
  0.8862745098039215,
  0.20392156862745098,
  1
);
var green = new Rgba(
  0.45098039215686275,
  0.8235294117647058,
  0.08627450980392157,
  1
);
var dark_green = new Rgba(
  0.3058823529411765,
  0.6039215686274509,
  0.023529411764705882,
  1
);
var light_blue = new Rgba(
  0.4470588235294118,
  0.6235294117647059,
  0.8117647058823529,
  1
);
var blue = new Rgba(
  0.20392156862745098,
  0.396078431372549,
  0.6431372549019608,
  1
);
var dark_blue = new Rgba(
  0.12549019607843137,
  0.2901960784313726,
  0.5294117647058824,
  1
);
var light_purple = new Rgba(
  0.6784313725490196,
  0.4980392156862745,
  0.6588235294117647,
  1
);
var purple = new Rgba(
  0.4588235294117647,
  0.3137254901960784,
  0.4823529411764706,
  1
);
var dark_purple = new Rgba(
  0.3607843137254902,
  0.20784313725490197,
  0.4,
  1
);
var light_brown = new Rgba(
  0.9137254901960784,
  0.7254901960784313,
  0.43137254901960786,
  1
);
var brown = new Rgba(
  0.7568627450980392,
  0.49019607843137253,
  0.06666666666666667,
  1
);
var dark_brown = new Rgba(
  0.5607843137254902,
  0.34901960784313724,
  0.00784313725490196,
  1
);
var black = new Rgba(0, 0, 0, 1);
var white = new Rgba(1, 1, 1, 1);
var light_grey = new Rgba(
  0.9333333333333333,
  0.9333333333333333,
  0.9254901960784314,
  1
);
var grey = new Rgba(
  0.8274509803921568,
  0.8431372549019608,
  0.8117647058823529,
  1
);
var dark_grey = new Rgba(
  0.7294117647058823,
  0.7411764705882353,
  0.7137254901960784,
  1
);
var light_gray = new Rgba(
  0.9333333333333333,
  0.9333333333333333,
  0.9254901960784314,
  1
);
var gray = new Rgba(
  0.8274509803921568,
  0.8431372549019608,
  0.8117647058823529,
  1
);
var dark_gray = new Rgba(
  0.7294117647058823,
  0.7411764705882353,
  0.7137254901960784,
  1
);
var light_charcoal = new Rgba(
  0.5333333333333333,
  0.5411764705882353,
  0.5215686274509804,
  1
);
var charcoal = new Rgba(
  0.3333333333333333,
  0.3411764705882353,
  0.3254901960784314,
  1
);
var dark_charcoal = new Rgba(
  0.1803921568627451,
  0.20392156862745098,
  0.21176470588235294,
  1
);
var pink = new Rgba(1, 0.6862745098039216, 0.9529411764705882, 1);

// build/dev/javascript/gleam_community_ansi/gleam_community/ansi.mjs
var Code = class extends CustomType {
  constructor(open, close, regexp) {
    super();
    this.open = open;
    this.close = close;
    this.regexp = regexp;
  }
};
function run(text, code2) {
  return code2.open + replace(text, code2.regexp, code2.open) + code2.close;
}
var asci_escape_character = "\x1B";
function code(open, close) {
  let close_str = to_string2(close);
  let open_strs = map2(open, to_string2);
  return new Code(
    asci_escape_character + "[" + join2(open_strs, ";") + "m",
    asci_escape_character + "[" + close_str + "m",
    asci_escape_character + "[" + close_str + "m"
  );
}
function yellow2(text) {
  return run(text, code(toList([33]), 39));
}

// build/dev/javascript/gleam_stdlib/gleam/uri.mjs
var Uri = class extends CustomType {
  constructor(scheme, userinfo, host, port, path, query, fragment) {
    super();
    this.scheme = scheme;
    this.userinfo = userinfo;
    this.host = host;
    this.port = port;
    this.path = path;
    this.query = query;
    this.fragment = fragment;
  }
};
function regex_submatches(pattern, string3) {
  let _pipe = pattern;
  let _pipe$1 = compile(_pipe, new Options(true, false));
  let _pipe$2 = nil_error(_pipe$1);
  let _pipe$3 = map3(
    _pipe$2,
    (_capture) => {
      return scan(_capture, string3);
    }
  );
  let _pipe$4 = try$(_pipe$3, first);
  let _pipe$5 = map3(_pipe$4, (m) => {
    return m.submatches;
  });
  return unwrap2(_pipe$5, toList([]));
}
function noneify_query(x) {
  if (x instanceof None) {
    return new None();
  } else {
    let x$1 = x[0];
    let $ = pop_grapheme2(x$1);
    if ($.isOk() && $[0][0] === "?") {
      let query = $[0][1];
      return new Some(query);
    } else {
      return new None();
    }
  }
}
function noneify_empty_string(x) {
  if (x instanceof Some && x[0] === "") {
    return new None();
  } else if (x instanceof None) {
    return new None();
  } else {
    return x;
  }
}
function extra_required(loop$list, loop$remaining) {
  while (true) {
    let list = loop$list;
    let remaining = loop$remaining;
    if (remaining === 0) {
      return 0;
    } else if (list.hasLength(0)) {
      return remaining;
    } else {
      let xs = list.tail;
      loop$list = xs;
      loop$remaining = remaining - 1;
    }
  }
}
function pad_list(list, size) {
  let _pipe = list;
  return append(
    _pipe,
    repeat(new None(), extra_required(list, size))
  );
}
function split_authority(authority) {
  let $ = unwrap(authority, "");
  if ($ === "") {
    return [new None(), new None(), new None()];
  } else if ($ === "//") {
    return [new None(), new Some(""), new None()];
  } else {
    let authority$1 = $;
    let matches = (() => {
      let _pipe = "^(//)?((.*)@)?(\\[[a-zA-Z0-9:.]*\\]|[^:]*)(:(\\d*))?";
      let _pipe$1 = regex_submatches(_pipe, authority$1);
      return pad_list(_pipe$1, 6);
    })();
    if (matches.hasLength(6)) {
      let userinfo = matches.tail.tail.head;
      let host = matches.tail.tail.tail.head;
      let port = matches.tail.tail.tail.tail.tail.head;
      let userinfo$1 = noneify_empty_string(userinfo);
      let host$1 = noneify_empty_string(host);
      let port$1 = (() => {
        let _pipe = port;
        let _pipe$1 = unwrap(_pipe, "");
        let _pipe$2 = parse2(_pipe$1);
        return from_result(_pipe$2);
      })();
      return [userinfo$1, host$1, port$1];
    } else {
      return [new None(), new None(), new None()];
    }
  }
}
function do_parse(uri_string) {
  let pattern = "^(([a-z][a-z0-9\\+\\-\\.]*):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#.*)?";
  let matches = (() => {
    let _pipe = pattern;
    let _pipe$1 = regex_submatches(_pipe, uri_string);
    return pad_list(_pipe$1, 8);
  })();
  let $ = (() => {
    if (matches.hasLength(8)) {
      let scheme2 = matches.tail.head;
      let authority_with_slashes = matches.tail.tail.head;
      let path2 = matches.tail.tail.tail.tail.head;
      let query_with_question_mark = matches.tail.tail.tail.tail.tail.head;
      let fragment2 = matches.tail.tail.tail.tail.tail.tail.tail.head;
      return [
        scheme2,
        authority_with_slashes,
        path2,
        query_with_question_mark,
        fragment2
      ];
    } else {
      return [new None(), new None(), new None(), new None(), new None()];
    }
  })();
  let scheme = $[0];
  let authority = $[1];
  let path = $[2];
  let query = $[3];
  let fragment = $[4];
  let scheme$1 = noneify_empty_string(scheme);
  let path$1 = unwrap(path, "");
  let query$1 = noneify_query(query);
  let $1 = split_authority(authority);
  let userinfo = $1[0];
  let host = $1[1];
  let port = $1[2];
  let fragment$1 = (() => {
    let _pipe = fragment;
    let _pipe$1 = to_result(_pipe, void 0);
    let _pipe$2 = try$(_pipe$1, pop_grapheme2);
    let _pipe$3 = map3(_pipe$2, second);
    return from_result(_pipe$3);
  })();
  let scheme$2 = (() => {
    let _pipe = scheme$1;
    let _pipe$1 = noneify_empty_string(_pipe);
    return map(_pipe$1, lowercase2);
  })();
  return new Ok(
    new Uri(scheme$2, userinfo, host, port, path$1, query$1, fragment$1)
  );
}
function parse3(uri_string) {
  return do_parse(uri_string);
}
function to_string6(uri) {
  let parts = (() => {
    let $ = uri.fragment;
    if ($ instanceof Some) {
      let fragment = $[0];
      return toList(["#", fragment]);
    } else {
      return toList([]);
    }
  })();
  let parts$1 = (() => {
    let $ = uri.query;
    if ($ instanceof Some) {
      let query = $[0];
      return prepend("?", prepend(query, parts));
    } else {
      return parts;
    }
  })();
  let parts$2 = prepend(uri.path, parts$1);
  let parts$3 = (() => {
    let $ = uri.host;
    let $1 = starts_with2(uri.path, "/");
    if ($ instanceof Some && !$1 && $[0] !== "") {
      let host = $[0];
      return prepend("/", parts$2);
    } else {
      return parts$2;
    }
  })();
  let parts$4 = (() => {
    let $ = uri.host;
    let $1 = uri.port;
    if ($ instanceof Some && $1 instanceof Some) {
      let port = $1[0];
      return prepend(":", prepend(to_string2(port), parts$3));
    } else {
      return parts$3;
    }
  })();
  let parts$5 = (() => {
    let $ = uri.scheme;
    let $1 = uri.userinfo;
    let $2 = uri.host;
    if ($ instanceof Some && $1 instanceof Some && $2 instanceof Some) {
      let s = $[0];
      let u = $1[0];
      let h = $2[0];
      return prepend(
        s,
        prepend(
          "://",
          prepend(u, prepend("@", prepend(h, parts$4)))
        )
      );
    } else if ($ instanceof Some && $1 instanceof None && $2 instanceof Some) {
      let s = $[0];
      let h = $2[0];
      return prepend(s, prepend("://", prepend(h, parts$4)));
    } else if ($ instanceof Some && $1 instanceof Some && $2 instanceof None) {
      let s = $[0];
      return prepend(s, prepend(":", parts$4));
    } else if ($ instanceof Some && $1 instanceof None && $2 instanceof None) {
      let s = $[0];
      return prepend(s, prepend(":", parts$4));
    } else if ($ instanceof None && $1 instanceof None && $2 instanceof Some) {
      let h = $2[0];
      return prepend("//", prepend(h, parts$4));
    } else {
      return parts$4;
    }
  })();
  return concat3(parts$5);
}

// build/dev/javascript/gleam_http/gleam/http.mjs
var Get = class extends CustomType {
};
var Post = class extends CustomType {
};
var Head = class extends CustomType {
};
var Put = class extends CustomType {
};
var Delete = class extends CustomType {
};
var Trace = class extends CustomType {
};
var Connect = class extends CustomType {
};
var Options2 = class extends CustomType {
};
var Patch = class extends CustomType {
};
var Http = class extends CustomType {
};
var Https = class extends CustomType {
};
function method_to_string(method) {
  if (method instanceof Connect) {
    return "connect";
  } else if (method instanceof Delete) {
    return "delete";
  } else if (method instanceof Get) {
    return "get";
  } else if (method instanceof Head) {
    return "head";
  } else if (method instanceof Options2) {
    return "options";
  } else if (method instanceof Patch) {
    return "patch";
  } else if (method instanceof Post) {
    return "post";
  } else if (method instanceof Put) {
    return "put";
  } else if (method instanceof Trace) {
    return "trace";
  } else {
    let s = method[0];
    return s;
  }
}
function scheme_to_string(scheme) {
  if (scheme instanceof Http) {
    return "http";
  } else {
    return "https";
  }
}
function scheme_from_string(scheme) {
  let $ = lowercase2(scheme);
  if ($ === "http") {
    return new Ok(new Http());
  } else if ($ === "https") {
    return new Ok(new Https());
  } else {
    return new Error(void 0);
  }
}

// build/dev/javascript/gleam_http/gleam/http/request.mjs
var Request = class extends CustomType {
  constructor(method, headers, body, scheme, host, port, path, query) {
    super();
    this.method = method;
    this.headers = headers;
    this.body = body;
    this.scheme = scheme;
    this.host = host;
    this.port = port;
    this.path = path;
    this.query = query;
  }
};
function to_uri(request) {
  return new Uri(
    new Some(scheme_to_string(request.scheme)),
    new None(),
    new Some(request.host),
    request.port,
    request.path,
    request.query,
    new None()
  );
}
function from_uri(uri) {
  return then$(
    (() => {
      let _pipe = uri.scheme;
      let _pipe$1 = unwrap(_pipe, "");
      return scheme_from_string(_pipe$1);
    })(),
    (scheme) => {
      return then$(
        (() => {
          let _pipe = uri.host;
          return to_result(_pipe, void 0);
        })(),
        (host) => {
          let req = new Request(
            new Get(),
            toList([]),
            "",
            scheme,
            host,
            uri.port,
            uri.path,
            uri.query
          );
          return new Ok(req);
        }
      );
    }
  );
}
function to(url) {
  let _pipe = url;
  let _pipe$1 = parse3(_pipe);
  return then$(_pipe$1, from_uri);
}

// build/dev/javascript/gleam_http/gleam/http/response.mjs
var Response = class extends CustomType {
  constructor(status, headers, body) {
    super();
    this.status = status;
    this.headers = headers;
    this.body = body;
  }
};

// build/dev/javascript/gleam_javascript/ffi.mjs
var PromiseLayer = class _PromiseLayer {
  constructor(promise) {
    this.promise = promise;
  }
  static wrap(value) {
    return value instanceof Promise ? new _PromiseLayer(value) : value;
  }
  static unwrap(value) {
    return value instanceof _PromiseLayer ? value.promise : value;
  }
};
function resolve(value) {
  return Promise.resolve(PromiseLayer.wrap(value));
}
function then(promise, fn) {
  return promise.then((value) => fn(PromiseLayer.unwrap(value)));
}

// build/dev/javascript/gleam_javascript/gleam/javascript/promise.mjs
function try_await(promise, callback) {
  let _pipe = promise;
  return then(
    _pipe,
    (result) => {
      if (result.isOk()) {
        let a = result[0];
        return callback(a);
      } else {
        let e = result[0];
        return resolve(new Error(e));
      }
    }
  );
}

// build/dev/javascript/gleam_fetch/ffi.mjs
async function raw_send(request) {
  try {
    return new Ok(await fetch(request));
  } catch (error) {
    return new Error(new NetworkError(error.toString()));
  }
}
function from_fetch_response(response) {
  return new Response(
    response.status,
    List.fromArray([...response.headers]),
    response
  );
}
function request_common(request) {
  let url = to_string6(to_uri(request));
  let method = method_to_string(request.method).toUpperCase();
  let options = {
    headers: make_headers(request.headers),
    method
  };
  return [url, options];
}
function to_fetch_request(request) {
  let [url, options] = request_common(request);
  if (options.method !== "GET" && options.method !== "HEAD")
    options.body = request.body;
  return new globalThis.Request(url, options);
}
function make_headers(headersList) {
  let headers = new globalThis.Headers();
  for (let [k, v] of headersList)
    headers.append(k.toLowerCase(), v);
  return headers;
}
async function read_text_body(response) {
  let body;
  try {
    body = await response.body.text();
  } catch (error) {
    return new Error(new UnableToReadBody());
  }
  return new Ok(response.withFields({ body }));
}

// build/dev/javascript/gleam_fetch/gleam/fetch.mjs
var NetworkError = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var UnableToReadBody = class extends CustomType {
};
function send(request) {
  let _pipe = request;
  let _pipe$1 = to_fetch_request(_pipe);
  let _pipe$2 = raw_send(_pipe$1);
  return try_await(
    _pipe$2,
    (resp) => {
      return resolve(new Ok(from_fetch_response(resp)));
    }
  );
}

// build/dev/javascript/gleam_stdlib/gleam/io.mjs
function println(string3) {
  return console_log(string3);
}

// build/dev/javascript/pears/pears/input.mjs
var Input = class extends CustomType {
  constructor(tokens, cursor) {
    super();
    this.tokens = tokens;
    this.cursor = cursor;
  }
};
function get2(input2) {
  let _pipe = input2.tokens;
  let _pipe$1 = at(_pipe, input2.cursor);
  return from_result(_pipe$1);
}
function get_n(input2, n) {
  let _pipe = input2.tokens;
  let _pipe$1 = drop(_pipe, input2.cursor);
  return take(_pipe$1, n);
}
function next(input2) {
  return input2.withFields({ cursor: input2.cursor + 1 });
}
function next_n(input2, n) {
  return input2.withFields({ cursor: input2.cursor + n });
}

// build/dev/javascript/pears/pears.mjs
var Parsed = class extends CustomType {
  constructor(input2, value) {
    super();
    this.input = input2;
    this.value = value;
  }
};
var UnexpectedEndOfInput2 = class extends CustomType {
  constructor(input2, expected) {
    super();
    this.input = input2;
    this.expected = expected;
  }
};
var UnexpectedToken = class extends CustomType {
  constructor(input2, expected, found) {
    super();
    this.input = input2;
    this.expected = expected;
    this.found = found;
  }
};
function ok(input2, value) {
  return new Ok(new Parsed(input2, value));
}

// build/dev/javascript/pears/pears/combinators.mjs
function map5(p, fun) {
  return (input2) => {
    let _pipe = p(input2);
    return map3(
      _pipe,
      (parsed) => {
        return new Parsed(parsed.input, fun(parsed.value));
      }
    );
  };
}
function map_error2(p, fun) {
  return (input2) => {
    let _pipe = p(input2);
    return map_error(_pipe, fun);
  };
}
function to2(parser, value) {
  return map5(parser, (_) => {
    return value;
  });
}
function alt(parser_1, parser_2) {
  return (input2) => {
    let $ = parser_1(input2);
    if ($.isOk()) {
      let result = $[0];
      return new Ok(result);
    } else {
      return parser_2(input2);
    }
  };
}
function eof() {
  return (in$) => {
    let $ = get2(in$);
    if ($ instanceof None) {
      return ok(in$, void 0);
    } else {
      let token = $[0];
      return new Error(new UnexpectedToken(in$, toList(["EOF"]), token));
    }
  };
}
function satisfying(f) {
  return (in$) => {
    let $ = get2(in$);
    if ($ instanceof None) {
      return new Error(
        new UnexpectedEndOfInput2(in$, toList(["satifying predicate"]))
      );
    } else {
      let value = $[0];
      let $1 = f(value);
      if ($1) {
        return ok(next(in$), value);
      } else {
        return new Error(
          new UnexpectedToken(in$, toList(["satisfying predicate"]), value)
        );
      }
    }
  };
}
function just(item) {
  return (in$) => {
    let $ = get2(in$);
    if ($ instanceof None) {
      return new Error(
        new UnexpectedEndOfInput2(in$, toList([inspect2(item)]))
      );
    } else if ($ instanceof Some && isEqual($[0], item)) {
      let head = $[0];
      return new Ok(new Parsed(next(in$), item));
    } else {
      let head = $[0];
      return new Error(
        new UnexpectedToken(in$, toList([inspect2(item)]), head)
      );
    }
  };
}
function pair(p1, p2) {
  return (in$) => {
    return try$(
      p1(in$),
      (parsed_1) => {
        return try$(
          p2(parsed_1.input),
          (parsed_2) => {
            return ok(parsed_2.input, [parsed_1.value, parsed_2.value]);
          }
        );
      }
    );
  };
}
function do_sequence(parsers, input2, acc) {
  if (parsers.hasLength(0)) {
    return ok(input2, reverse(acc));
  } else {
    let parser = parsers.head;
    let rest = parsers.tail;
    return try$(
      parser(input2),
      (parsed) => {
        return do_sequence(rest, parsed.input, prepend(parsed.value, acc));
      }
    );
  }
}
function seq(parsers) {
  return (input2) => {
    return do_sequence(parsers, input2, toList([]));
  };
}
function left(p1, p2) {
  return (in$) => {
    return try$(
      p1(in$),
      (parsed_1) => {
        return try$(
          p2(parsed_1.input),
          (parsed_2) => {
            return ok(parsed_2.input, parsed_1.value);
          }
        );
      }
    );
  };
}
function right(p1, p2) {
  return (in$) => {
    return try$(
      p1(in$),
      (parsed_1) => {
        return try$(
          p2(parsed_1.input),
          (parsed_2) => {
            return ok(parsed_2.input, parsed_2.value);
          }
        );
      }
    );
  };
}
function many0(parser) {
  return (in$) => {
    let $ = parser(in$);
    if ($.isOk()) {
      let parsed = $[0];
      return try$(
        many0(parser)(parsed.input),
        (next2) => {
          return ok(next2.input, prepend(parsed.value, next2.value));
        }
      );
    } else {
      return ok(in$, toList([]));
    }
  };
}
function many1(parser) {
  return (in$) => {
    return try$(
      parser(in$),
      (parsed) => {
        return try$(
          many0(parser)(parsed.input),
          (rest) => {
            return ok(rest.input, prepend(parsed.value, rest.value));
          }
        );
      }
    );
  };
}
function lazy(f) {
  return (input2) => {
    return f()(input2);
  };
}
function one_of(items) {
  let _pipe = satisfying((c) => {
    return contains(items, c);
  });
  return map_error2(
    _pipe,
    (err) => {
      let expected = map2(items, inspect2);
      if (err instanceof UnexpectedToken) {
        let in$ = err.input;
        let token = err.found;
        return new UnexpectedToken(in$, expected, token);
      } else {
        let in$ = err.input;
        return new UnexpectedEndOfInput2(in$, expected);
      }
    }
  );
}
function none_of(items) {
  return satisfying((c) => {
    return !contains(items, c);
  });
}
function between(parser, open, close) {
  let _pipe = open;
  let _pipe$1 = right(_pipe, parser);
  return left(_pipe$1, close);
}
function do_choice(parsers, expected) {
  return (in$) => {
    if (parsers.hasLength(0)) {
      let $ = get2(in$);
      if ($ instanceof None) {
        return new Error(new UnexpectedEndOfInput2(in$, expected));
      } else {
        let token = $[0];
        return new Error(new UnexpectedToken(in$, expected, token));
      }
    } else {
      let parser = parsers.head;
      let rest = parsers.tail;
      let $ = parser(in$);
      if ($.isOk()) {
        let parsed = $[0];
        return new Ok(parsed);
      } else {
        let err = $[0];
        let new_expected = (() => {
          if (err instanceof UnexpectedToken) {
            let expected$1 = err.expected;
            return expected$1;
          } else {
            let expected$1 = err.expected;
            return expected$1;
          }
        })();
        return do_choice(rest, concat(toList([expected, new_expected])))(
          in$
        );
      }
    }
  };
}
function choice(parsers) {
  return do_choice(parsers, toList([]));
}
function sep_by0(parser, separator) {
  return (in$) => {
    let $ = parser(in$);
    if ($.isOk()) {
      let parsed = $[0];
      return try$(
        many0(right(separator, parser))(parsed.input),
        (rest) => {
          return ok(rest.input, prepend(parsed.value, rest.value));
        }
      );
    } else {
      return ok(in$, toList([]));
    }
  };
}
function maybe(parser) {
  return (in$) => {
    let $ = parser(in$);
    if ($.isOk()) {
      let parsed = $[0];
      return ok(parsed.input, new Some(parsed.value));
    } else {
      return ok(in$, new None());
    }
  };
}
function recognize(parser) {
  return (in$) => {
    return try$(
      parser(in$),
      (parsed) => {
        let start = in$.cursor;
        let parsed_length = parsed.input.cursor - start;
        let consumed = (() => {
          let _pipe = in$.tokens;
          let _pipe$1 = drop(_pipe, start);
          return take(_pipe$1, parsed_length);
        })();
        return ok(parsed.input, consumed);
      }
    );
  };
}

// build/dev/javascript/pears/pears/chars.mjs
function digit() {
  return one_of(toList(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]));
}
function string(str) {
  return (in$) => {
    let s = graphemes(str);
    let length4 = length(s);
    let candidate = get_n(in$, length4);
    let $ = isEqual(candidate, s);
    if ($) {
      return ok(next_n(in$, length4), str);
    } else {
      if (candidate.hasLength(0)) {
        return new Error(new UnexpectedEndOfInput2(in$, toList([str])));
      } else {
        let head = candidate.head;
        return new Error(new UnexpectedToken(in$, toList([str]), head));
      }
    }
  };
}
function input(s) {
  let tokens = graphemes(s);
  return new Input(tokens, 0);
}

// build/dev/javascript/jasper/jasper.mjs
var UnexpectedToken2 = class extends CustomType {
  constructor(found) {
    super();
    this.found = found;
  }
};
var UnexpectedEndOfInput3 = class extends CustomType {
};
var Object2 = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Array2 = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var String2 = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Number2 = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Boolean = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Null = class extends CustomType {
};
var Root = class extends CustomType {
};
var Key = class extends CustomType {
  constructor(query, key) {
    super();
    this.query = query;
    this.key = key;
  }
};
var KeyOr = class extends CustomType {
  constructor(query, key, or2) {
    super();
    this.query = query;
    this.key = key;
    this.or = or2;
  }
};
var Index = class extends CustomType {
  constructor(query, index3) {
    super();
    this.query = query;
    this.index = index3;
  }
};
var IndexOr = class extends CustomType {
  constructor(query, index3, or2) {
    super();
    this.query = query;
    this.index = index3;
    this.or = or2;
  }
};
var Filter = class extends CustomType {
  constructor(query, predicate) {
    super();
    this.query = query;
    this.predicate = predicate;
  }
};
var Map2 = class extends CustomType {
  constructor(query, mapping) {
    super();
    this.query = query;
    this.mapping = mapping;
  }
};
var MapKeys = class extends CustomType {
  constructor(query, mapping) {
    super();
    this.query = query;
    this.mapping = mapping;
  }
};
var MapValues = class extends CustomType {
  constructor(query, mapping) {
    super();
    this.query = query;
    this.mapping = mapping;
  }
};
var FilterMap = class extends CustomType {
  constructor(query, mapping) {
    super();
    this.query = query;
    this.mapping = mapping;
  }
};
var ForEach = class extends CustomType {
  constructor(query) {
    super();
    this.query = query;
  }
};
var InvEnd = class extends CustomType {
};
var InvKey = class extends CustomType {
  constructor(key, query) {
    super();
    this.key = key;
    this.query = query;
  }
};
var InvKeyOr = class extends CustomType {
  constructor(key, or2, query) {
    super();
    this.key = key;
    this.or = or2;
    this.query = query;
  }
};
var InvIndex = class extends CustomType {
  constructor(index3, query) {
    super();
    this.index = index3;
    this.query = query;
  }
};
var InvIndexOr = class extends CustomType {
  constructor(index3, or2, query) {
    super();
    this.index = index3;
    this.or = or2;
    this.query = query;
  }
};
var InvFilter = class extends CustomType {
  constructor(predicate, query) {
    super();
    this.predicate = predicate;
    this.query = query;
  }
};
var InvMap = class extends CustomType {
  constructor(mapping, query) {
    super();
    this.mapping = mapping;
    this.query = query;
  }
};
var InvMapKeys = class extends CustomType {
  constructor(mapping, query) {
    super();
    this.mapping = mapping;
    this.query = query;
  }
};
var InvMapValues = class extends CustomType {
  constructor(mapping, query) {
    super();
    this.mapping = mapping;
    this.query = query;
  }
};
var InvFilterMap = class extends CustomType {
  constructor(mapping, query) {
    super();
    this.mapping = mapping;
    this.query = query;
  }
};
var InvForEach = class extends CustomType {
  constructor(query) {
    super();
    this.query = query;
  }
};
var InvForEachOk = class extends CustomType {
  constructor(query) {
    super();
    this.query = query;
  }
};
var UnexpectedType = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var MissingObjectKey = class extends CustomType {
  constructor(x0, key) {
    super();
    this[0] = x0;
    this.key = key;
  }
};
var IndexOutOfBounds = class extends CustomType {
  constructor(x0, index3) {
    super();
    this[0] = x0;
    this.index = index3;
  }
};
function run_parser(input2, parser) {
  let $ = parser(input(input2));
  if ($.isOk() && $[0] instanceof Parsed) {
    let j = $[0].value;
    return new Ok(j);
  } else {
    let e = $[0];
    return new Error(
      (() => {
        if (e instanceof UnexpectedToken) {
          let f = e.found;
          return new UnexpectedToken2(f);
        } else {
          return new UnexpectedEndOfInput3();
        }
      })()
    );
  }
}
function ws0() {
  let _pipe = one_of(toList([" ", "\n", "\r", "	"]));
  return many0(_pipe);
}
function padded(p) {
  return left(p, ws0());
}
function symbol(s) {
  return padded(string(s));
}
function value_parser() {
  let hex_digit = one_of(
    toList([
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F"
    ])
  );
  let unicode_escape_digits = recognize(
    seq(toList([hex_digit, hex_digit, hex_digit, hex_digit]))
  );
  let escape = (() => {
    let _pipe2 = just("\\");
    return right(
      _pipe2,
      choice(
        toList([
          just("\\"),
          just("/"),
          just('"'),
          to2(just("b"), "\b"),
          to2(just("f"), "\f"),
          to2(just("n"), "\n"),
          to2(just("r"), "\r"),
          to2(just("t"), "	"),
          map5(
            right(just("u"), unicode_escape_digits),
            (value2) => {
              let $ = base_parse(concat3(value2), 16);
              if (!$.isOk()) {
                throw makeError(
                  "assignment_no_match",
                  "jasper",
                  85,
                  "",
                  "Assignment pattern did not match",
                  { value: $ }
                );
              }
              let number = $[0];
              let $1 = utf_codepoint(number);
              if (!$1.isOk()) {
                throw makeError(
                  "assignment_no_match",
                  "jasper",
                  86,
                  "",
                  "Assignment pattern did not match",
                  { value: $1 }
                );
              }
              let codepoint2 = $1[0];
              return utf_codepoint_list_to_string(toList([codepoint2]));
            }
          )
        ])
      )
    );
  })();
  let str = (() => {
    let _pipe2 = none_of(toList(['"', "\\"]));
    let _pipe$1 = alt(_pipe2, escape);
    let _pipe$2 = many0(_pipe$1);
    let _pipe$3 = map5(_pipe$2, concat3);
    return between(_pipe$3, just('"'), just('"'));
  })();
  let value = lazy(value_parser);
  let num = (() => {
    let _pipe2 = maybe(just("-"));
    let _pipe$1 = pair(
      _pipe2,
      (() => {
        let _pipe$12 = alt(
          to2(just("0"), toList(["0"])),
          recognize(
            pair(
              one_of(toList(["1", "2", "3", "4", "5", "6", "7", "8", "9"])),
              many0(digit())
            )
          )
        );
        return map5(_pipe$12, concat3);
      })()
    );
    let _pipe$2 = pair(
      _pipe$1,
      maybe(
        (() => {
          let _pipe$22 = just(".");
          let _pipe$32 = right(_pipe$22, many1(digit()));
          return map5(_pipe$32, concat3);
        })()
      )
    );
    let _pipe$3 = pair(
      _pipe$2,
      (() => {
        let _pipe$32 = recognize(
          maybe(
            (() => {
              let _pipe$33 = alt(just("e"), just("E"));
              let _pipe$4 = pair(_pipe$33, maybe(one_of(toList(["+", "-"]))));
              return pair(_pipe$4, many1(digit()));
            })()
          )
        );
        return map5(_pipe$32, concat3);
      })()
    );
    return map5(
      _pipe$3,
      (p) => {
        let neg = p[0][0][0];
        let ns = p[0][0][1];
        let ds = p[0][1];
        let ex = p[1];
        let _pipe$4 = unwrap(neg, "") + ns + "." + unwrap(
          ds,
          "0"
        ) + ex;
        let _pipe$5 = parse(_pipe$4);
        let _pipe$6 = unwrap2(
          _pipe$5,
          (() => {
            if (neg instanceof Some) {
              return -17976931348623157e292;
            } else {
              return 17976931348623157e292;
            }
          })()
        );
        return new Number2(_pipe$6);
      }
    );
  })();
  let bool = alt(
    to2(string("true"), new Boolean(true)),
    to2(string("false"), new Boolean(false))
  );
  let null$ = to2(string("null"), new Null());
  let array2 = (() => {
    let _pipe2 = sep_by0(value, symbol(","));
    let _pipe$1 = between(_pipe2, symbol("["), symbol("]"));
    return map5(_pipe$1, (var0) => {
      return new Array2(var0);
    });
  })();
  let obj = (() => {
    let _pipe2 = str;
    let _pipe$1 = left(_pipe2, symbol(":"));
    let _pipe$2 = pair(_pipe$1, value);
    let _pipe$3 = sep_by0(_pipe$2, symbol(","));
    let _pipe$4 = map5(_pipe$3, from_list);
    let _pipe$5 = between(_pipe$4, symbol("{"), symbol("}"));
    return map5(_pipe$5, (var0) => {
      return new Object2(var0);
    });
  })();
  let _pipe = choice(
    toList([
      num,
      bool,
      null$,
      map5(str, (var0) => {
        return new String2(var0);
      }),
      array2,
      obj
    ])
  );
  return padded(_pipe);
}
function json_parser() {
  let _pipe = value_parser();
  return between(_pipe, ws0(), eof());
}
function parse_json(value) {
  return run_parser(value, json_parser());
}
function invert_query_rec(loop$query, loop$state) {
  while (true) {
    let query = loop$query;
    let state = loop$state;
    if (query instanceof Root) {
      return state;
    } else if (query instanceof Key) {
      let query$1 = query.query;
      let key = query.key;
      loop$query = query$1;
      loop$state = new InvKey(key, state);
    } else if (query instanceof KeyOr) {
      let query$1 = query.query;
      let key = query.key;
      let o = query.or;
      loop$query = query$1;
      loop$state = new InvKeyOr(key, o, state);
    } else if (query instanceof Index) {
      let query$1 = query.query;
      let index3 = query.index;
      loop$query = query$1;
      loop$state = new InvIndex(index3, state);
    } else if (query instanceof IndexOr) {
      let query$1 = query.query;
      let index3 = query.index;
      let or2 = query.or;
      loop$query = query$1;
      loop$state = new InvIndexOr(index3, or2, state);
    } else if (query instanceof Filter) {
      let query$1 = query.query;
      let predicate = query.predicate;
      loop$query = query$1;
      loop$state = new InvFilter(predicate, state);
    } else if (query instanceof Map2) {
      let query$1 = query.query;
      let mapping = query.mapping;
      loop$query = query$1;
      loop$state = new InvMap(mapping, state);
    } else if (query instanceof MapKeys) {
      let query$1 = query.query;
      let mapping = query.mapping;
      loop$query = query$1;
      loop$state = new InvMapKeys(mapping, state);
    } else if (query instanceof MapValues) {
      let query$1 = query.query;
      let mapping = query.mapping;
      loop$query = query$1;
      loop$state = new InvMapValues(mapping, state);
    } else if (query instanceof FilterMap) {
      let query$1 = query.query;
      let mapping = query.mapping;
      loop$query = query$1;
      loop$state = new InvFilterMap(mapping, state);
    } else if (query instanceof ForEach) {
      let query$1 = query.query;
      loop$query = query$1;
      loop$state = new InvForEach(state);
    } else {
      let query$1 = query.query;
      loop$query = query$1;
      loop$state = new InvForEachOk(state);
    }
  }
}
function invert_query(query) {
  return invert_query_rec(query, new InvEnd());
}
function query_json_rec(loop$json, loop$query) {
  while (true) {
    let json = loop$json;
    let query = loop$query;
    if (query instanceof InvEnd) {
      return new Ok(json);
    } else if (query instanceof InvKey) {
      let key = query.key;
      let q = query.query;
      let _pipe = (() => {
        if (json instanceof Object2) {
          let j = json;
          let obj = json[0];
          let _pipe2 = obj;
          let _pipe$12 = get(_pipe2, key);
          return replace_error(_pipe$12, new MissingObjectKey(j, key));
        } else {
          let j = json;
          return new Error(new UnexpectedType(j));
        }
      })();
      let _pipe$1 = map3(
        _pipe,
        (_capture) => {
          return query_json_rec(_capture, q);
        }
      );
      return flatten(_pipe$1);
    } else if (query instanceof InvKeyOr) {
      let key = query.key;
      let or2 = query.or;
      let q = query.query;
      let _pipe = (() => {
        if (json instanceof Object2) {
          let obj = json[0];
          let _pipe2 = obj;
          let _pipe$12 = get(_pipe2, key);
          let _pipe$2 = unwrap2(_pipe$12, or2);
          return new Ok(_pipe$2);
        } else {
          let j = json;
          return new Error(new UnexpectedType(j));
        }
      })();
      let _pipe$1 = map3(
        _pipe,
        (_capture) => {
          return query_json_rec(_capture, q);
        }
      );
      return flatten(_pipe$1);
    } else if (query instanceof InvIndex) {
      let index3 = query.index;
      let q = query.query;
      let _pipe = (() => {
        if (json instanceof Array2) {
          let j = json;
          let arr = json[0];
          let _pipe2 = arr;
          let _pipe$12 = at(_pipe2, index3);
          return replace_error(_pipe$12, new IndexOutOfBounds(j, index3));
        } else {
          let j = json;
          return new Error(new UnexpectedType(j));
        }
      })();
      let _pipe$1 = map3(
        _pipe,
        (_capture) => {
          return query_json_rec(_capture, q);
        }
      );
      return flatten(_pipe$1);
    } else if (query instanceof InvIndexOr) {
      let index3 = query.index;
      let or2 = query.or;
      let q = query.query;
      let _pipe = (() => {
        if (json instanceof Array2) {
          let arr = json[0];
          let _pipe2 = arr;
          let _pipe$12 = at(_pipe2, index3);
          let _pipe$2 = unwrap2(_pipe$12, or2);
          return new Ok(_pipe$2);
        } else {
          let j = json;
          return new Error(new UnexpectedType(j));
        }
      })();
      let _pipe$1 = map3(
        _pipe,
        (_capture) => {
          return query_json_rec(_capture, q);
        }
      );
      return flatten(_pipe$1);
    } else if (query instanceof InvFilter) {
      let predicate = query.predicate;
      let q = query.query;
      if (json instanceof Array2) {
        let arr = json[0];
        let _pipe = arr;
        let _pipe$1 = filter(_pipe, predicate);
        let _pipe$2 = new Array2(_pipe$1);
        loop$json = _pipe$2;
        loop$query = q;
      } else {
        let j = json;
        return new Error(new UnexpectedType(j));
      }
    } else if (query instanceof InvMap) {
      let mapping = query.mapping;
      let q = query.query;
      if (json instanceof Array2) {
        let arr = json[0];
        let _pipe = arr;
        let _pipe$1 = map2(_pipe, mapping);
        let _pipe$2 = new Array2(_pipe$1);
        loop$json = _pipe$2;
        loop$query = q;
      } else {
        let j = json;
        return new Error(new UnexpectedType(j));
      }
    } else if (query instanceof InvMapKeys) {
      let mapping = query.mapping;
      let q = query.query;
      if (json instanceof Object2) {
        let obj = json[0];
        let _pipe = obj;
        let _pipe$1 = map_to_list(_pipe);
        let _pipe$2 = map2(
          _pipe$1,
          (kv) => {
            return [mapping(kv[0]), kv[1]];
          }
        );
        let _pipe$3 = from_list(_pipe$2);
        let _pipe$4 = new Object2(_pipe$3);
        loop$json = _pipe$4;
        loop$query = q;
      } else {
        let j = json;
        return new Error(new UnexpectedType(j));
      }
    } else if (query instanceof InvMapValues) {
      let mapping = query.mapping;
      let q = query.query;
      if (json instanceof Object2) {
        let obj = json[0];
        let _pipe = obj;
        let _pipe$1 = map_values(_pipe, mapping);
        let _pipe$2 = new Object2(_pipe$1);
        loop$json = _pipe$2;
        loop$query = q;
      } else {
        let j = json;
        return new Error(new UnexpectedType(j));
      }
    } else if (query instanceof InvFilterMap) {
      let mapping = query.mapping;
      let q = query.query;
      if (json instanceof Array2) {
        let arr = json[0];
        let _pipe = arr;
        let _pipe$1 = filter_map(_pipe, mapping);
        let _pipe$2 = new Array2(_pipe$1);
        loop$json = _pipe$2;
        loop$query = q;
      } else {
        let j = json;
        return new Error(new UnexpectedType(j));
      }
    } else if (query instanceof InvForEach) {
      let q = query.query;
      if (json instanceof Array2) {
        let arr = json[0];
        let _pipe = arr;
        let _pipe$1 = map2(
          _pipe,
          (_capture) => {
            return query_json_rec(_capture, q);
          }
        );
        let _pipe$2 = all(_pipe$1);
        return map3(_pipe$2, (var0) => {
          return new Array2(var0);
        });
      } else {
        let j = json;
        return new Error(new UnexpectedType(j));
      }
    } else {
      let q = query.query;
      if (json instanceof Array2) {
        let arr = json[0];
        let _pipe = arr;
        let _pipe$1 = map2(
          _pipe,
          (_capture) => {
            return query_json_rec(_capture, q);
          }
        );
        let _pipe$2 = values(_pipe$1);
        let _pipe$3 = new Array2(_pipe$2);
        return new Ok(_pipe$3);
      } else {
        let j = json;
        return new Error(new UnexpectedType(j));
      }
    }
  }
}
function query_json(json, query) {
  return query_json_rec(json, invert_query(query));
}

// build/dev/javascript/garnet_tool/example.mjs
function fetch2(word) {
  let url = (() => {
    let _pipe = toList([
      "https://api.dictionaryapi.dev/api/v2/entries/en/",
      word
    ]);
    return concat3(_pipe);
  })();
  let $ = to(url);
  if (!$.isOk()) {
    throw makeError(
      "assignment_no_match",
      "example",
      41,
      "fetch",
      "Assignment pattern did not match",
      { value: $ }
    );
  }
  let req = $[0];
  return try_await(
    send(req),
    (resp) => {
      return try_await(
        read_text_body(resp),
        (resp2) => {
          return resolve(new Ok(resp2.body));
        }
      );
    }
  );
}
function parse5(body) {
  let $ = parse_json(body);
  if (!$.isOk()) {
    throw makeError(
      "assignment_no_match",
      "example",
      49,
      "parse",
      "Assignment pattern did not match",
      { value: $ }
    );
  }
  let json = $[0];
  let $1 = query_json(
    json,
    (() => {
      let _pipe = new Root();
      let _pipe$1 = new Index(_pipe, 0);
      let _pipe$2 = new Key(_pipe$1, "meanings");
      let _pipe$3 = new Index(_pipe$2, 0);
      let _pipe$4 = new Key(_pipe$3, "definitions");
      let _pipe$5 = new Index(_pipe$4, 0);
      return new Key(_pipe$5, "definition");
    })()
  );
  if (!$1.isOk() || !($1[0] instanceof String2)) {
    throw makeError(
      "assignment_no_match",
      "example",
      50,
      "parse",
      "Assignment pattern did not match",
      { value: $1 }
    );
  }
  let definition = $1[0][0];
  return definition;
}
function main() {
  let word = "gleam";
  return then(
    fetch2(word),
    (body) => {
      let $ = try$(
        body,
        (body2) => {
          let mean = parse5(body2);
          println(
            (() => {
              let _pipe = "Gleam mean...";
              return yellow2(_pipe);
            })()
          );
          println(
            (() => {
              let _pipe = mean;
              return yellow2(_pipe);
            })()
          );
          return new Ok(mean);
        }
      );
      return resolve(new Ok(void 0));
    }
  );
}
export {
  fetch2 as fetch,
  main
};
