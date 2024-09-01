(async function exportMarkdown() {
  // Get parent chat container
  const chatContainer = document.querySelector(
    "div.flex-1.flex.flex-col.gap-3.px-4");

  // Get chat title (if exists)
  const title = document.querySelector(
    "button[data-testid='chat-menu-trigger']")?.textContent || "";

  const timestamp = getTimestamp();
  let markdown = `# ${title || "Claude Chat"}\n\`${timestamp}\`\n`;

  function convertMarkdown(ele, caption) {
    let firstChild = ele;
    if (firstChild.firstChild?.tagName === "DIV") {
      firstChild = firstChild.firstChild;
      if (firstChild.firstChild?.tagName === "DIV") firstChild = firstChild.firstChild;
    }
    if (!firstChild.firstChild) return;

    markdown += caption;

    // Parse child elements
    for (const child of firstChild.childNodes) {
      markdown += parseChildElement(child);
    }
  }

  function modifyForObsidian(s) {
    s = s.replace(/(?<!^)\$\$(.*?)\$\$(?!$)/gm, '$$$1$$'); // inline math
    return s;
  }

  for (const ele of chatContainer.childNodes) {
    const user = ele.querySelector("div.font-user-message");
    if (user) {
      convertMarkdown(user, "\n## Prompt:\n\n");
      continue;
    }

    const claude = ele.querySelector("div.font-claude-message");
    if (claude) {
      const buttons = Array.from(claude.nextSibling.getElementsByTagName("button")).filter(b => b.innerText == "Copy")
      if (!buttons.length) {
        convertMarkdown(claude, "_Claude_:\n");
        continue;
      }
      markdown += "_Claude_:\n";
      const clip = navigator.clipboard;
      if (!clip._writeText) clip._writeText = clip.writeText;
      await new Promise((resolve, reject) => {
        clip.writeText = async arg => {
          markdown += modifyForObsidian(arg).trimEnd() + "\n";
          resolve();
        };
        try {
          buttons[0].click();
        } catch (e) {
          reject(e);
        }
      });
      clip.writeText = clip._writeText;
    }
  }

  // Save to file
  save(".md", "text/plain", title, markdown);

  function parseChildElement(childNode) {
    if (childNode.nodeType !== Node.ELEMENT_NODE) return "";

    const tag = childNode.tagName;
    const text = childNode.textContent;
    let markdown = "";

    // Paragraphs
    if (tag === "P") {
      markdown += `${text}\n`;
    }

    // Get list items
    if (tag === "OL") {
      let index = 0;
      childNode.childNodes.forEach((listItemNode) => {
        if (
          listItemNode.nodeType === Node.ELEMENT_NODE &&
          listItemNode.tagName === "LI"
        ) {
          markdown += `${++index}. ${
            listItemNode.textContent
          }\n`;
        }
      });
    }
    if (tag === "UL") {
      childNode.childNodes.forEach((listItemNode) => {
        if (
          listItemNode.nodeType === Node.ELEMENT_NODE &&
          listItemNode.tagName === "LI"
        ) {
          markdown += `- ${listItemNode.textContent}\n`;
        }
      });
    }

    // Code blocks
    if (tag === "PRE") {
      const codeBlockSplit = text.split("Copy code");
      const codeBlockLang = codeBlockSplit[0].trim();
      const codeBlockData = codeBlockSplit[1].trim();
      markdown += `\`\`\`${codeBlockLang}\n${codeBlockData}\n\`\`\`\n`;
    }
    if (tag === "DIV") {
      const div = childNode.querySelector("div.code-block__code");
      if (!div) return "";
      const codeBlockData = div.innerText.trim();
      markdown += `\`\`\`\n${codeBlockData}\n\`\`\`\n`;
    }

    // Quotes
    if (tag === "BLOCKQUOTE") {
      for (const line of text.trim().split("\n")) {
        markdown += `> ${line}\n`;
      }
    }

    // Tables
    if (tag === "TABLE") {
      // Get table sections
      let tableMarkdown = "";
      childNode.childNodes.forEach((tableSectionNode) => {
        if (
          tableSectionNode.nodeType === Node.ELEMENT_NODE &&
          (tableSectionNode.tagName === "THEAD" ||
            tableSectionNode.tagName === "TBODY")
        ) {
          // Get table rows
          let tableRows = "";
          let tableColCount = 0;
          tableSectionNode.childNodes.forEach(
            (tableRowNode) => {
              if (
                tableRowNode.nodeType === Node.ELEMENT_NODE &&
                tableRowNode.tagName === "TR"
              ) {
                // Get table cells
                let tableCells = "";

                tableRowNode.childNodes.forEach(
                  (tableCellNode) => {
                    if (
                      tableCellNode.nodeType ===
                        Node.ELEMENT_NODE &&
                      (tableCellNode.tagName === "TD" ||
                        tableCellNode.tagName === "TH")
                    ) {
                      tableCells += `| ${tableCellNode.textContent} `;
                      if (
                        tableSectionNode.tagName === "THEAD"
                      ) {
                        tableColCount++;
                      }
                    }
                  }
                );
                tableRows += `${tableCells}|\n`;
              }
            }
          );

          tableMarkdown += tableRows;

          if (tableSectionNode.tagName === "THEAD") {
            const headerRowDivider = `| ${Array(tableColCount)
              .fill("---")
              .join(" | ")} |\n`;
            tableMarkdown += headerRowDivider;
          }
        }
      });
      markdown += tableMarkdown;
    }

    // Paragraph break after each element
    return markdown + "\n";
  }

  function save(extension, mimeType, title, data) {
    let filename = title ? title.trim().toLowerCase().replace(/^[^\w\d]+|[^\w\d]+$/g, '').replace(/[\s\W-]+/g, '-') : "claude";
    filename += extension;

    const blob = new Blob([data], { type: mimeType });

    const a = document.createElement("a");
    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = [mimeType, a.download, a.href].join(":");

    const e = new MouseEvent("click", {
      canBubble: true,
      cancelable: false,
      view: window,
      detail: 0,
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      button: 0,
      relatedTarget: null,
    });

    a.dispatchEvent(e);
  }

  function getTimestamp() {
    return new Date(
      new Date(new Date(new Date()).toISOString()).getTime() -
        new Date().getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
  }
})();
