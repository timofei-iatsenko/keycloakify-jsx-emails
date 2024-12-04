import { render as _render, renderPlainText } from "jsx-email";

export async function render(component: React.ReactElement, plainText: boolean) {
  if (plainText) {
    return await renderPlainText(component, {
      formatters: {
        rawOutput: (elem, _walk, builder) => {
          if (elem.children.length && elem.children[0].type === "comment") {
            builder.addInline(elem.children[0].data!.trim());
          }
        },
      },
      selectors: [
        {
          selector: "jsx-email-raw",
          format: "rawOutput",
          options: {},
        },
      ],
    });
  }

  let html = await _render(component, {
    pretty: true,
  });

  html = html.replace(/<jsx-email-raw><!--\s*(.*?)\s*--><\/jsx-email-raw>/g, "$1");
  return html;
}
