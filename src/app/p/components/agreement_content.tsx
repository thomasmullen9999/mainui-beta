import React, { useEffect, useState } from "react";
import Link from "next/link";
import Markdown from "./markdownagreement";

export interface Agreement {
  title?: string;
  author?: string;
  date?: string;
  content: ContentBlock[];
}

export type ContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | BulletBlock
  | MarkdownBlock;

export interface ParagraphBlock {
  type: "paragraph";
  elements: ParagraphElement[];
}

export interface HeadingBlock {
  type: "heading";
  level: number;
  text: string;
}

interface BulletBlock {
  type: "bullet";
  elements: ParagraphElement[];
}

interface MarkdownBlock {
  type: "markdown";
  elements: ParagraphElement[];
}

export type ParagraphElement = TextElement | LinkElement | NewLineElement;

export interface TextElement {
  type: "text";
  text: string;
}

export interface LinkElement {
  type: "link";
  href: string;
  text: string;
}

interface NewLineElement {
  type: "newline";
  text: string;
}

export function AgreementContent({ content }: Agreement) {
  const [agreementText, setAgreementText] = useState<Agreement | null>({
    content: content,
  });

  if (!agreementText) {
    return <div>Loading...</div>;
  }

  const parseMarkdown = (jsonText: string) => {
    const scriptTagRegex = /{{(.*?)}}/g;

    if (typeof jsonText === "string") {
      if (scriptTagRegex.test(jsonText)) {
        jsonText = jsonText.replace(
          scriptTagRegex,
          (match: any, script: string) => {
            try {
              const executeCode = new Function("return " + script + ";");
              return executeCode();
            } catch (error) {
              console.error("Error evaluating script:", error);
              return match;
            }
          }
        );
      }
    }

    return jsonText;
  };

  const renderContent = (content: ContentBlock[]) => {
    return content.map((block, index) => {
      switch (block.type) {
        case "paragraph":
          return (
            <div key={`corelang-${index}`}>
              {block.elements.map((element, i) => {
                switch (element.type) {
                  case "text":
                    return element.text;
                  case "newline":
                    return (
                      <span key={i}>
                        <br />
                        <br />
                      </span>
                    );
                  case "link":
                    return (
                      <Link key={i} href={element.href} target="_blank">
                        <span className="text-blue-500 underline hover:no-underline">
                          {" "}
                          {element.text}
                        </span>
                      </Link>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          );
        case "bullet":
          return (
            <ul key={`corelang-${index}`} className="list-disc">
              {block.elements.map((element, i) => {
                switch (element.type) {
                  case "text":
                    return <li key={i}>{element.text}</li>;
                  default:
                    return null;
                }
              })}
            </ul>
          );
        case "heading":
          return (
            <h3
              className="my-5"
              key={index}
              style={{
                color: "#008080",
                fontSize: "1.25rem",
                fontWeight: "600",
              }}
            >
              {block.text}
            </h3>
          );
        case "markdown":
          return (
            <>
              {block.elements.map((element, i) => {
                return (
                  <>
                    <Markdown key={i} content={parseMarkdown(element.text)} />
                  </>
                );
              })}
            </>
          );

        default:
          return null;
      }
    });
  };

  return <div>{renderContent(agreementText.content)}</div>;
}

export default AgreementContent;
