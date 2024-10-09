const vscode = require('vscode');
const marked = require('marked');

class WebviewManager {
    constructor(context) {
        this.context = context;
        this.currentPanel = undefined;
    }

    showAnalysis(analysis) {
        if (this.currentPanel) {
            this.currentPanel.reveal(vscode.ViewColumn.Beside);
        } else {
            this.currentPanel = vscode.window.createWebviewPanel(
                'markdownRenderer',
                'Codinsight',
                {
                    viewColumn: vscode.ViewColumn.Beside,
                    preserveFocus: true
                },
                {
                    enableScripts: true
                }
            );

            this.currentPanel.onDidDispose(
                () => {
                    this.currentPanel = undefined;
                },
                null,
                this.context.subscriptions
            );
        }

        this._updateWebview(analysis);
    }

    _updateWebview(markdownText) {
        const htmlContent = marked.parse(markdownText);
        this.currentPanel.webview.html = this._getWebviewContent(htmlContent);
    }

    _getWebviewContent(renderedHtml) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Codinsight</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                        line-height: 1.6;
                        color: var(--vscode-editor-foreground);
                        padding: 20px;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    h1, h2 {
                        border-bottom: 1px solid var(--vscode-panel-border);
                        padding-bottom: 10px;
                        margin-top: 30px;
                    }
                    pre {
                        background-color: var(--vscode-textCodeBlock-background);
                        padding: 15px;
                        border-radius: 5px;
                        overflow-x: auto;
                    }
                    code {
                        font-family: 'Fira Code', 'Consolas', 'Courier New', monospace;
                        font-size: 14px;
                    }
                    ul {
                        padding-left: 20px;
                    }
                    li {
                        margin-bottom: 10px;
                    }
                    .highlight {
                        background-color: var(--vscode-editor-selectionBackground);
                        padding: 2px 5px;
                        border-radius: 3px;
                    }
                </style>
            </head>
            <body>
                <div class="content">
                    ${renderedHtml}
                </div>
            </body>
            </html>
        `;
    }
}

module.exports = WebviewManager;