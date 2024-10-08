# Codinsight

Codinsight is a Visual Studio Code extension that helps developers understand code quickly and easily. It uses advanced language models to provide insightful explanations of selected code snippets, making it easier to comprehend complex or legacy code.

## Features

- **Code Explanation**: Select any piece of code and get a detailed explanation.
- **Syntax Highlighting**: Explanations include syntax-highlighted code snippets for better readability.
- **Context-Aware Analysis**: The extension considers the context of your code to provide more accurate explanations.
- **Support for Multiple Languages**: Works with various programming languages supported by VS Code.

## Installation

1. Open Visual Studio Code
2. Go to the Extensions view (Ctrl+Shift+X)
3. Search for "Codinsight"
4. Click Install

## Usage

1. Select a piece of code in your editor
2. Right-click and choose "Explain Selected Code" from the context menu, or use the command palette (Ctrl+Shift+P) and type "Explain Selected Code"
3. A new panel will open with a detailed explanation of the selected code

## Requirements

- Visual Studio Code version 1.60.0 or higher

## Extension Settings

This extension contributes the following settings:

* `codinsight.maxTokens`: Maximum number of tokens to use for code explanation (default: 1000)
* `codinsight.language`: Preferred language model for code explanation (default: "gpt-3.5-turbo")

## Known Issues

- Large code selections may take longer to process
- Highly specialized or domain-specific code may receive generic explanations

## Contributing

We welcome contributions to Codinsight! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for details on how to get started.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Thanks to the VS Code team for their excellent extension API
- Powered by [OpenAI's GPT-3.5](https://openai.com/blog/gpt-3-5-turbo-0613/) (or your chosen language model)

---

For more information, please visit our [GitHub repository](https://github.com/yourusername/codinsight).