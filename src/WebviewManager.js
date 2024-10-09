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
                <title>Markdown Preview</title>
                <style>
                    body { font-family: var(--vscode-font-family); padding: 20px; color: var(--vscode-editor-foreground); }
                    pre { background-color: var(--vscode-textCodeBlock-background); padding: 10px; border-radius: 5px; }
                    code { font-family: var(--vscode-editor-font-family); }
                </style>
            </head>
            <body>
                ${renderedHtml}
            </body>
            </html>
        `;
    }
}

module.exports = WebviewManager;