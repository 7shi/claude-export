(async function exportMarkdown() {
  function save(extension, mimeType, title, data) {
    let filename = title ? title.trim().toLowerCase().replace(/^[^\w\d]+|[^\w\d]+$/g, '').replace(/[\s\W-]+/g, '-') : "claude";
    filename += extension;

    var blob = new Blob([data], { type: mimeType });
    var a = document.createElement("a");

    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = [mimeType, a.download, a.href].join(":");
    var e = new MouseEvent("click", {
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

  function getContents() {
    // Get parent chat container
    const chatContainer = document.querySelector(
      "div.flex-1.flex.flex-col.gap-3.px-4"
    );

    // Get chat title (if exists)
    const titleEle = document.querySelector(
      "button[data-testid='chat-menu-trigger']"
    );
    const title = titleEle ? titleEle.textContent : "";

    // Find all chat elements
    const elements = chatContainer.querySelectorAll(
      "div.font-claude-message, div.font-user-message"
    );

    return { elements, title };
  }

  var markdown = "";
  // var elements = document.querySelectorAll("[class*='min-h-[20px]']");

  const { elements, title } = getContents();

  var timestamp = getTimestamp();
  markdown += `\# ${title || "Claude Chat"}\n\`${timestamp}\`\n`;

  for (var i = 0; i < elements.length; i++) {
    var ele = elements[i];

    // Get first child
    var firstChild = ele;
    if (firstChild.firstChild?.tagName === "DIV") {
      firstChild = firstChild.firstChild;
      if (firstChild.firstChild?.tagName === "DIV") firstChild = firstChild.firstChild;
    }
    if (!firstChild.firstChild) continue;

    // Element child
    if (firstChild.nodeType === Node.ELEMENT_NODE) {
      var childNodes = firstChild.childNodes;

      // Prefix Claude reponse label
      if (ele.classList.contains("font-claude-message")) {
        markdown += `_Claude_:\n`;
        var clip = navigator.clipboard;
        if (!clip._writeText) clip._writeText = clip.writeText;
        for (var copy of Array.from(ele.nextSibling.getElementsByTagName("button")).filter(b => b.innerText == "Copy")) {
          await new Promise((resolve, reject) => {
            clip.writeText = async arg => {
              arg = arg.replace(/(?<!^)\$\$(.*?)\$\$(?!$)/gm, '$$$1$$'); // inline math
              markdown += arg.trimEnd() + "\n";
              resolve();
            };
            try {
              copy.click();
            } catch (e) {
              reject(e);
            }
          });
        }
        clip.writeText = clip._writeText;
      } else {
        markdown += `\n## Prompt:\n\n`;

        // Parse child elements
        for (var n = 0; n < childNodes.length; n++) {
          const childNode = childNodes[n];

          if (childNode.nodeType === Node.ELEMENT_NODE) {
            var tag = childNode.tagName;
            var text = childNode.textContent;
            // Paragraphs
            if (tag === "P") {
              markdown += `${text}\n`;
            }

            // Get list items
            if (tag === "OL") {
              var index = 0;
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
              childNode.childNodes.forEach((listItemNode, index) => {
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
            markdown += "\n";
          }
        }
      }
    }

    // Text child
    if (firstChild.nodeType === Node.TEXT_NODE) {
      // Prefix User prompt label
      // markdown += `_Prompt_: \n`;
      // markdown += `${firstChild.textContent}\n`;

      // End of prompt paragraphs breaks
      markdown += "\n";
    }
  }

  // Save to file
  save(".md", "text/plain", title, markdown);
})();
