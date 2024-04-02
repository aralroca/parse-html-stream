const decoder = new TextDecoder();
const LAST_CHUNK_COMMENT_CONTENT = "l-c";
const LAST_CHUNK_COMMENT = `<!--${LAST_CHUNK_COMMENT_CONTENT}-->`;

export default async function htmlStreamWalker(
  streamReader: ReadableStreamDefaultReader<Uint8Array>,
) {
  const doc = document.implementation.createHTMLDocument();
  let closed = false;

  doc.open();
  await waitNextChunk();

  const rootNode = closed ? null : doc.documentElement;

  async function waitNextChunk() {
    const { done, value } = await streamReader.read();

    if (done) {
      if (!closed) doc.close();
      closed = true;
      return;
    }

    doc.write(decoder.decode(value) + LAST_CHUNK_COMMENT);
  }

  function next(field: "firstChild" | "nextSibling") {
    return async (node: Node) => {
      if (!node) return null;

      const it = document.createNodeIterator(
        node,
        128 /* NodeFilter.SHOW_COMMENT */,
      );

      // Wait for other chunks when it's in the middle of the stream
      while (it.nextNode()) {
        const rNode = it.referenceNode as Comment;
        if (rNode.nodeValue === LAST_CHUNK_COMMENT_CONTENT) {
          rNode.remove();
          await waitNextChunk();
        }
      }

      return node[field];
    };
  }

  return {
    rootNode,
    firstChild: next("firstChild"),
    nextSibling: next("nextSibling"),
  };
}
