/**
 * Description:
 *
 *   This module provides a function to parse an HTML stream into a 
 *   generator of nodes.
 */
export default async function* parseHTMLStream(
  streamReader: ReadableStreamDefaultReader<Uint8Array>,
  text = "",
): AsyncGenerator<Node>;
