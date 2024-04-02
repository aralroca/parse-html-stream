import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

describe("parse-html-stream", () => {
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
    const nodes = [];

    const parseHTMLStream = await import(".").then((m) => m.default);

    for await (const node of parseHTMLStream(reader)) {
      nodes.push(node);
    }

    expect(nodes).toEqual([]);
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
    const nodeNames = [];

    const parseHTMLStream = await import(".").then((m) => m.default);

    for await (const node of parseHTMLStream(reader)) {
      nodeNames.push(node?.nodeName);
    }

    expect(nodeNames).toEqual(["HTML", "HEAD", "BODY", "DIV", "#text"]);
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
    const nodeNames = [];

    const parseHTMLStream = await import(".").then((m) => m.default);

    for await (const node of parseHTMLStream(reader)) {
      nodeNames.push(node?.nodeName);
    }

    expect(nodeNames).toEqual([
      "HTML",
      "HEAD",
      "BODY",
      "DIV",
      "#comment",
      "#text",
    ]);
  });

  it("should be possible to read the attributes of a node HTMLElement", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('<div class="foo">Bar</div>'));
        controller.close();
      },
    });

    const reader = stream.getReader();
    const nodes: Node[] = [];

    const parseHTMLStream = await import(".").then((m) => m.default);

    for await (const node of parseHTMLStream(reader)) {
      nodes.push(node);
    }

    expect(nodes).toHaveLength(5);
    expect(nodes[0]?.nodeName).toBe("HTML");
    expect(nodes[1]?.nodeName).toBe("HEAD");
    expect(nodes[2]?.nodeName).toBe("BODY");
    expect(nodes[3]?.nodeName).toBe("DIV");
    expect(nodes[4]?.nodeName).toBe("#text");
    expect((nodes[3] as HTMLElement).getAttribute("class")).toBe("foo");
  });

  it("should work with very nested HTML", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode("<html>"));
        controller.enqueue(encoder.encode("<head />"));
        controller.enqueue(encoder.encode("<body>"));
        controller.enqueue(encoder.encode('<div class="foo">'));
        controller.enqueue(encoder.encode('<div class="bar">'));
        controller.enqueue(encoder.encode('<div class="baz">'));
        controller.enqueue(encoder.encode('<div class="qux">'));
        controller.enqueue(encoder.encode("Hello"));
        controller.enqueue(encoder.encode("</div>"));
        controller.enqueue(encoder.encode("</div>"));
        controller.enqueue(encoder.encode("</div>"));
        controller.enqueue(encoder.encode("</div>"));
        controller.enqueue(encoder.encode("</body>"));
        controller.enqueue(encoder.encode("</html>"));
        controller.close();
      },
    });

    const reader = stream.getReader();
    const nodes = [];

    const parseHTMLStream = await import(".").then((m) => m.default);

    for await (const node of parseHTMLStream(reader)) {
      nodes.push(node);
    }

    expect(nodes).toHaveLength(8);
    expect(nodes[0]?.nodeName).toBe("HTML");
    expect(nodes[1]?.nodeName).toBe("HEAD");
    expect(nodes[2]?.nodeName).toBe("BODY");
    expect(nodes[3]?.nodeName).toBe("DIV");
    expect((nodes[3] as HTMLElement).classList.contains("foo")).toBeTrue();
    expect(nodes[4]?.nodeName).toBe("DIV");
    expect((nodes[4] as HTMLElement).classList.contains("bar")).toBeTrue();
    expect(nodes[5]?.nodeName).toBe("DIV");
    expect((nodes[5] as HTMLElement).classList.contains("baz")).toBeTrue();
    expect(nodes[6]?.nodeName).toBe("DIV");
    expect((nodes[6] as HTMLElement).classList.contains("qux")).toBeTrue();
    expect(nodes[7]?.nodeName).toBe("#text");
    expect(nodes[7]?.textContent).toBe("Hello");
  });
});
