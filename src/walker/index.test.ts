import { describe, it, expect } from "bun:test";
import { JSDOM } from "jsdom";
import htmlStreamWalker from ".";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
global.document = dom.window.document;
global.window = dom.window;

describe("htmlStreamWalker", () => {
  it("should handle an empty HTML stream", async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.close();
      },
    });

    const reader = stream.getReader();

    const { rootNode } = await htmlStreamWalker(reader);

    expect(rootNode).toBeEmpty();
  });

  it("should transform a stream of HTML into a stream of nodes", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode("<html>"));
        controller.enqueue(encoder.encode("<head />"));
        controller.enqueue(encoder.encode("<body>"));
        controller.enqueue(encoder.encode('<div class="foo">Bar</div>'));
        controller.enqueue(encoder.encode("</body>"));
        controller.enqueue(encoder.encode("</html>"));
        controller.close();
      },
    });

    const reader = stream.getReader();

    const { rootNode, firstChild, nextSibling } =
      await htmlStreamWalker(reader);

    expect(rootNode?.nodeName).toBe("HTML");

    const child = await firstChild(rootNode!);
    expect(child?.nodeName).toBe("HEAD");

    const body = await nextSibling(child!);
    expect(body?.nodeName).toBe("BODY");

    const div = await firstChild(body!);
    expect(div?.nodeName).toBe("DIV");

    const text = await firstChild(div!);
    expect(text?.nodeName).toBe("#text");
    expect(text?.textContent).toBe("Bar");
  });

  it("should work with comments", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode("<html>"));
        controller.enqueue(encoder.encode("<head />"));
        controller.enqueue(encoder.encode("<body>"));
        controller.enqueue(
          encoder.encode('<div class="foo"><!-- comment -->Bar</div>'),
        );
        controller.enqueue(encoder.encode("</body>"));
        controller.enqueue(encoder.encode("</html>"));
        controller.close();
      },
    });

    const reader = stream.getReader();

    const { rootNode, firstChild, nextSibling } =
      await htmlStreamWalker(reader);

    expect(rootNode?.nodeName).toBe("HTML");

    const child = await firstChild(rootNode!);
    expect(child?.nodeName).toBe("HEAD");

    const body = await nextSibling(child!);
    expect(body?.nodeName).toBe("BODY");

    const div = await firstChild(body!);
    expect(div?.nodeName).toBe("DIV");

    const comment = await firstChild(div!);
    expect(comment?.nodeName).toBe("#comment");

    const text = await nextSibling(comment!);
    expect(text?.nodeName).toBe("#text");
    expect(text?.textContent).toBe("Bar");
  });
});
