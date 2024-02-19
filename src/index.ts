const decoder = new TextDecoder();

export default async function* parseHTMLStream(
  streamReader: ReadableStreamDefaultReader<Uint8Array>,
  doc = document.implementation.createHTMLDocument(),
  lastChunkNode: Node | null = null,
): AsyncGenerator<Node> {
  const { done, value } = await streamReader.read();

  if (done) return;

  doc.write(decoder.decode(value));

  let lastNode = lastChunkNode
    ? getNextNode(lastChunkNode)
    : doc.documentElement;

  for (let node = lastNode; node; node = getNextNode(node)) {
    if (node) lastNode = node;
    yield node;
  }

  yield* await parseHTMLStream(streamReader, doc, lastNode ?? lastChunkNode);
}

/**
 * Get the next node in the tree.
 * It uses depth-first search in order to work with the streamed HTML.
 */
function getNextNode(node: Node | null, deeperDone?: Boolean): Node | null {
  if (!node) return null;
  if (node.childNodes.length && !deeperDone) return node.firstChild;
  return node.nextSibling ?? getNextNode(node.parentNode, true);
}
