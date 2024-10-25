const vscode = require('vscode');
const LanguageManagerFactory = require('./src/language_manager/LanguageManagerFactory');
const CodeAnalyzer = require('./src/CodeAnalyzer');
const WebviewManager = require('./src/WebviewManager');

function activate(context) {
    console.log('Code Explainer extension is now active');
    
    let disposable = vscode.commands.registerCommand('extension.explainCode', async () => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Analyzing Code...",
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ increment: 0 });

                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage('No active editor found.');
                    return;
                }

                progress.report({ increment: 20, message: "Preparing language manager..." });
                const document = editor.document;
                const languageManager = LanguageManagerFactory.getLanguageManager(document.languageId);
                await languageManager.ensureLanguageMode(document);

                progress.report({ increment: 20, message: "Extracting code..." });
                // const methods = await languageManager.getMethodsSymbols(document.uri);
                const code = await languageManager.getUserSelectedCode(editor);

                if (!code) return;

                progress.report({ increment: 20, message: "Analyzing code..." });
                const codeAnalyzer = new CodeAnalyzer(context);
                const analysis = await codeAnalyzer.analyzeCode(code);

                progress.report({ increment: 20, message: "Preparing results..." });
                const webviewManager = new WebviewManager(context);
                if (analysis != null){
                    webviewManager.showAnalysis(analysis);
                    progress.report({ increment: 20, message: "Done!" });
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Error: ${error.message}`);
            }
        });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };