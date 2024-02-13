# parse-html-stream

## Overview

`parse-html-stream` is a JavaScript library designed for client-side applications, specifically tailored for processing HTML streams. The primary objective is to capture and manipulate DOM Nodes as they are received, enabling seamless integration into hypermedia communication paradigms, such as HTMX.

<div align="center">

[![npm version](https://badge.fury.io/js/parse-html-stream.svg)](https://badge.fury.io/js/parse-html-stream)
![npm](https://img.shields.io/npm/dw/parse-html-stream)
[![size](https://img.shields.io/bundlephobia/minzip/parse-html-stream)](https://bundlephobia.com/package/parse-html-stream)
[![PRs Welcome][badge-prwelcome]][prwelcome]
<a href="https://github.com/aralroca/parse-html-stream/actions?query=workflow%3ACI" alt="Tests status">
<img src="https://github.com/aralroca/parse-html-stream/workflows/CI/badge.svg" /></a>
<a href="https://twitter.com/intent/follow?screen_name=aralroca">
<img src="https://img.shields.io/twitter/follow/aralroca?style=social&logo=x"
            alt="follow on Twitter"></a>

</div>

[badge-prwelcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prwelcome]: http://makeapullrequest.com
[spectrum]: https://spectrum.chat/parse-html-stream

## Getting started

Run:

```sh
bun install parse-html-stream
```

## Usage Example

Utilize the library by leveraging the asynchronous generator for parsing HTML streams. The following TypeScript example demonstrates its usage:

```ts
import parseHTMLStream from 'parse-html-stream';

// ...

const reader = res.body.getReader();

for await (const node of parseHTMLStream(reader)) {
  console.log(node);
}
```

This code snippet showcases how to iterate through the DOM Nodes in a streaming fashion, offering a practical approach for processing HTML streams in real-time.
