import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import htmlStreamWalker from ".";

describe("htmlStreamWalker", () => {
  beforeEach(async () => {
    GlobalRegistrator.register();
  });
  afterEach(() => {
    GlobalRegistrator.unregister();
  });

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

    const { rootNode, firstChild, nextSibling, doc } =
      await htmlStreamWalker(reader);

    expect(rootNode?.nodeName).toBe("HTML");

    const child = await firstChild(rootNode!);
    console.log(doc().documentElement.outerHTML);
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

  it.only("should detect the first child of a div when the first child is a text node", async () => {
    const readable = new ReadableStream({
      start: (controller) => {
        controller.enqueue(new TextEncoder().encode("<div>"));
        controller.enqueue(new TextEncoder().encode("text a"));
        controller.enqueue(new TextEncoder().encode("text c"));
        controller.enqueue(new TextEncoder().encode("</div>"));
        controller.close();
      },
    });
    const reader = readable.getReader();
    const walker = await htmlStreamWalker(reader);
    const el2 = (walker.rootNode as any)!.querySelector("div") as HTMLElement;
    const text = await walker.firstChild(el2);

    await walker.waitNextChunk();

    expect(text?.textContent).toBe("text a");

    const text2 = await walker.nextSibling(text!);
    await walker.waitNextChunk();
    expect(text2?.textContent).toBe("text c");
  });

  it("should work with different children", async () => {
    const readable = new ReadableStream({
      start: (controller) => {
        controller.enqueue(new TextEncoder().encode("<div>"));
        controller.enqueue(new TextEncoder().encode('<a href="link2">'));
        controller.enqueue(new TextEncoder().encode("hello2"));
        controller.enqueue(new TextEncoder().encode("</a>"));
        controller.enqueue(new TextEncoder().encode("<i>text1</i>"));
        controller.enqueue(new TextEncoder().encode("</div>"));
        controller.close();
      },
    });
    const reader = readable.getReader();
    const walker = await htmlStreamWalker(reader);
    const element = (walker.rootNode as any)!.querySelector("div")!;

    await walker.waitNextChunk();
    await walker.waitNextChunk();
    await walker.waitNextChunk();
    await walker.waitNextChunk();
    await walker.waitNextChunk();

    expect(element.outerHTML).toBe(
      '<div><a href="link2">hello2</a><i>text1</i></div>',
    );
  });

  it("should keep the lang on HTML", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('<html lang="en">'));
        controller.enqueue(encoder.encode("<head />"));
        controller.enqueue(encoder.encode("<body>"));
        controller.enqueue(encoder.encode('<div class="foo">Bar</div>'));
        controller.enqueue(encoder.encode("</body>"));
        controller.enqueue(encoder.encode("</html>"));
        controller.close();
      },
    });

    const reader = stream.getReader();

    const { rootNode } = await htmlStreamWalker(reader);

    expect(rootNode?.nodeName).toBe("HTML");
    expect(rootNode?.getAttribute("lang")).toBe("en");
  });
});
