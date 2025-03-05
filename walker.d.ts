export default async function htmlStreamWalker(
  streamReader: ReadableStreamDefaultReader<Uint8Array>,
): Promise<{
  rootNode: Node | null;
  firstChild: (node: Node) => Promise<Node | null>;
  nextSibling: (node: Node) => Promise<Node | null>;
}>
