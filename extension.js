const vscode = require('vscode');
const LanguageManagerFactory = require('./src/language_manager/LanguageManagerFactory');
const CodeAnalyzer = require('./src/CodeAnalyzer');
const WebviewManager = require('./src/WebviewManager');

function activate(context) {
    console.log('Code Explainer extension is now active');
    
    let disposable = vscode.commands.registerCommand('extension.explainCode', async () => {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage('No active editor found.');
                return;
            }

            const document = editor.document;
            const languageManager = LanguageManagerFactory.getLanguageManager(document.languageId);
            await languageManager.ensureLanguageMode(document);

            const methods = await languageManager.getMethodsSymbols(document.uri);
            const code = await languageManager.getUserSelectedCode(editor, methods);

            if (!code) return;

            const codeAnalyzer = new CodeAnalyzer();
            const analysis = await codeAnalyzer.analyzeCode(code);

            const webviewManager = new WebviewManager(context);
            webviewManager.showAnalysis(analysis);
        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };