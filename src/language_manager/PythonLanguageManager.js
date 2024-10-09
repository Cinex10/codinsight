const vscode = require('vscode');
const LanguageManager = require('./LanguageManager');

class PythonLanguageManager extends LanguageManager {
    async ensureLanguageMode(document) {
        if (document.languageId !== 'python') {
            await vscode.languages.setTextDocumentLanguage(document, 'python');
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    async getMethodsSymbols(uri) {
        const symbols = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', uri);
        return symbols.filter(symbol => symbol.kind === vscode.SymbolKind.Function);
    }

    async getUserSelectedCode(editor, methods) {
        const FREE_SELECT_OPTION = 'Free code selection';
        const options = [...methods.map(method => method.name), FREE_SELECT_OPTION];

        const selection = await vscode.window.showQuickPick(options, {
            placeHolder: 'Choose a method or select a portion of code'
        });

        if (!selection) return null;

        const document = editor.document;
        if (selection === FREE_SELECT_OPTION) {
            const text = document.getText(editor.selection);
            return this._handleFreeCodeSelection(text);
        } else {
            const method = methods.find(method => method.name === selection);
            return this._getSymbolCode(document, method);
        }
    }

    _handleFreeCodeSelection(text) {
        if (text.length === 0) {
            vscode.window.showInformationMessage('Please select some code to explain.');
            return null;
        }
        return text;
    }

    _getSymbolCode(document, symbol) {
        const range = new vscode.Range(
            symbol.range.start.line,
            symbol.range.start.character,
            symbol.range.end.line,
            symbol.range.end.character
        );
        return document.getText(range);
    }
}

module.exports = PythonLanguageManager;