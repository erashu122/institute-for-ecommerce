import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { RichText } from "../../src/features/content/rich-text";

it("renders formatting while omitting executable markup and unsafe URLs", () => {
  const html = renderToStaticMarkup(
    createElement(RichText, {
      text: "**Bold**\n\n<script>alert(1)</script>\n\n[unsafe](javascript:alert%281%29)\n\n<iframe src='https://example.com'></iframe>",
    }),
  );
  expect(html).toContain("<strong>Bold</strong>");
  expect(html).not.toContain("<script");
  expect(html).not.toContain("<iframe");
  expect(html).not.toContain("javascript:");
});
