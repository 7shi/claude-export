# Export/Download Claude Conversations (claude-export)

This is a fork from [ryanschiang/claude-export](https://github.com/ryanschiang/claude-export). The source code has been reorganized, focusing on the conversion to Markdown.

[![GitHub license](https://img.shields.io/badge/license-MIT-green)](
    ./LICENSE
)

This browser script formats and downloads Anthropic Claude conversations to markdown for sharing and exporting chat logs.

You can export the active Claude chat log directly from the browser console, entirely locally. No data is sent to any server.

**Supports the latest Claude web UI as of August 23, 2024.**

## Usage

 1. Navigate to [claude.ai](https://claude.ai).
 2. Open the chat thread you'd like to export.
 3. Open the browser console (how to open console: [Chrome](https://developer.chrome.com/docs/devtools/open), [Firefox](https://firefox-source-docs.mozilla.org/devtools-user/), [Safari](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/Web_Inspector_Tutorial/EnableWebInspector/EnableWebInspector.html))
 4. Follow the below steps depending on which output type you'd like.

> [!IMPORTANT]  
> Always be careful when pasting code into the console. Only paste code from trusted sources, as it can be used to execute malicious code.
> You can explore this repository and verify the code before pasting it into the console, or clone and build the code yourself.

### Markdown

1. Copy contents of [`/dist/md.min.js`](./dist/md.min.js)
2. Paste into browser console

#### Example output (Markdown):

````markdown
# Sending Javascript Requests
`2024-03-19 16:04:20`

## _Prompt_:

How can I send a request in Javascript?

_Claude_:
In JavaScript, you can send a request using the built-in fetch function or the XMLHttpRequest object. Here's an example using fetch:

```javascript
fetch('https://api.example.com/data')
.then(response => response.json())
.then(data => {
    // Handle the response data
    console.log(data);
})
.catch(error => {
    // Handle any errors
    console.error('Error:', error);
});
```

In this example, fetch sends a GET request to the specified URL (https://api.example.com/data). The then block is used to handle the response. The first then converts the response to JSON format using response.json(), and the second then receives the parsed JSON data, which you can then process as needed.
````

## Limitations

This is a trivial implementation as Claude currently does not support sharing or exporting conversations. It may break with future changes.

## You May Also Like

[`chatgpt-export`](https://github.com/ryanschiang/chatgpt-export) - Export OpenAI ChatGPT conversations to markdown, JSON, and PNG for sharing and exporting chat logs.
