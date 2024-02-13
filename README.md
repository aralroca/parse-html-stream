# parse-html-stream

<div align="center">

[![npm version](https://badge.fury.io/js/parse-html-stream.svg)](https://badge.fury.io/js/parse-html-stream)
![npm](https://img.shields.io/npm/dw/parse-html-stream)
[![size](https://img.shields.io/bundlephobia/minzip/parse-html-stream)](https://bundlephobia.com/package/parse-html-stream)
[![PRs Welcome][badge-prwelcome]][prwelcome]

</div>

## Overview

`parse-html-stream` is a JavaScript library designed for client-side applications, specifically tailored for processing HTML streams. The primary objective is to capture and manipulate DOM Nodes as they are received, enabling seamless integration into hypermedia communication paradigms, such as HTMX.

## Getting started

Run:

```sh
bun install parse-html-stream
```

## Usage Example

Utilize the library by leveraging the asynchronous iterator for parsing HTML streams. The following TypeScript example demonstrates its usage:

```ts
import parseHTMLStream from 'parse-html-stream';

const reader = res.body.getReader();

for await (const node of parseHTMLStream(reader)) {
  console.log(node);
}
```

This code snippet showcases how to iterate through the DOM Nodes in a streaming fashion, offering a practical approach for processing HTML streams in real-time.
