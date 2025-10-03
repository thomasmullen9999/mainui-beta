import React from "react";
import { marked } from "marked";
var renderer = new marked.Renderer();

renderer.link = ({ href, title, text }) => {
  return (
    '<a target="_blank" href="' +
    href +
    '" title="' +
    title +
    '">' +
    text +
    "</a>"
  );
};

const Markdown = ({ content }: { content: string }) => {
  return (
    <div
      className="prose prose-sm"
      dangerouslySetInnerHTML={{
        __html: marked.parse(content, { renderer: renderer }),
      }}
    />
  );
};

export default Markdown;
