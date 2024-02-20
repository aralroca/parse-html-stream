const decoder = new TextDecoder();
const AUTOCREATED_NODE_NAMES = new Set(["HTML", "HEAD", "BODY"]);

export default async function htmlStreamWalker(
  streamReader: ReadableStreamDefaultReader<Uint8Array>,
) {
  const doc = document.implementation.createHTMLDocument();

  async function waitNextChunk() {
    const { done, value } = await streamReader.read();
    if (!done) doc.write(decoder.decode(value));
    return done;
  }

  const done = await waitNextChunk();
  const rootNode = done ? null : doc.documentElement;

  function next(field: 'firstChild' | 'nextSibling') {
    return async (node: Node) => {
      if (!node) return null;
      if (AUTOCREATED_NODE_NAMES.has(node.nodeName)) await waitNextChunk();
      if (!node[field]) await waitNextChunk();
      if (node[field]) return node[field];
      return null;
    }
  }

  return { rootNode, firstChild: next('firstChild'), nextSibling: next('nextSibling') };
}
