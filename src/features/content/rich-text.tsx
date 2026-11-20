import Markdown from "react-markdown";

export function RichText({ text }: { text: string }) {
  return (
    <div className="space-y-4 leading-relaxed [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_h2]:font-serif [&_h2]:text-3xl [&_h3]:font-serif [&_h3]:text-2xl [&_li]:ml-6 [&_ol]:list-decimal [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:bg-white [&_pre]:p-4 [&_ul]:list-disc">
      <Markdown
        skipHtml
        components={{ h1: ({ children }) => <h2>{children}</h2> }}
        allowedElements={[
          "p",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "ul",
          "ol",
          "li",
          "strong",
          "em",
          "blockquote",
          "a",
          "code",
          "pre",
          "br",
          "hr",
        ]}
      >
        {text}
      </Markdown>
    </div>
  );
}
