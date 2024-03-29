export default async function htmlStreamWalker(
  streamReader: ReadableStreamDefaultReader<Uint8Array>,
): {
  rootNode: Node | null;
  firstChild: (node: Node) => Node | null;
  nextSibling: (node: Node) => Node | null;
}