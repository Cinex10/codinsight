const vscode = require('vscode');
const marked = require('marked');
const path = require('path');
const dotenv = require('dotenv');
const Groq = require('groq-sdk');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Now you can access environment variables like this:
const apiKey = process.env.LLM_API_KEY;

const FREE_SELECT_OPTION = 'Free code selection';

function activate(context) {
    console.log('Code Explainer extension is now active');
    let currentPanel = undefined;

    let disposable = vscode.commands.registerCommand('extension.explainCode', async () => {
        try{

            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const document = editor.document;
                await ensurePythonLanguageMode(document);
                const methods = await getMethodsSymbols(document.uri);
                const options = methods.map(method => method.name);
                options.push(FREE_SELECT_OPTION);

                const code = await vscode.window.showQuickPick(options, {
                    placeHolder: 'Choose a method or select a portion of code'
                })
                .then(selection => {
                    const code = handleUserChoice(selection, editor, methods);
                    return code;
                });

                const response = await analyzeCode(code);
                
                if (currentPanel) {
                    currentPanel.reveal(vscode.ViewColumn.Beside);
                } else {
                    currentPanel = vscode.window.createWebviewPanel(
                        'markdownRenderer',
                        'Codinsight',
                        {
                            viewColumn : vscode.ViewColumn.Beside,
                            preserveFocus: true
                        },
                        {
                            enableScripts: true
                        }
                    );

    
                    currentPanel.onDidDispose(
                        () => {
                            currentPanel = undefined;
                        },
                        null,
                        context.subscriptions
                    );
                }
                updateWebview(currentPanel, response['choices'][0]['message']['content']);
            } else {
                vscode.window.showInformationMessage('No active editor found.');
            }
        }catch (error){
            vscode.window.showInformationMessage(error);
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() { }

function updateWebview(panel, markdownText) {
    // console.log(markdownText);
    const htmlContent = marked.parse(markdownText);
    panel.webview.html = getWebviewContent(htmlContent);
}

function getWebviewContent(renderedHtml) {
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

async function ensurePythonLanguageMode(document) {
    if (document.languageId !== 'python') {
        await vscode.languages.setTextDocumentLanguage(document, 'python');
        // Wait a bit for the language mode to be applied
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

async function getMethodsSymbols(uri) {
    const symbols = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', uri);
    return symbols.filter(symbol => symbol.kind === vscode.SymbolKind.Function);
}

// return the portion of code that the user choose
function handleUserChoice(selection, editor, methods){
    if (selection == null) {
        return;
    }
    const document = editor.document;
    if (selection === FREE_SELECT_OPTION){
        // handle free code selection
        const text = document.getText(editor.selection);
        return handleFreeCodeSelection(text);
    }
    else{
        // handle when user choose a function directly
        const method = methods.find(method => method.name === selection);
        return getSymbolCode(document, method);
    }
}

function handleFreeCodeSelection(text) {
    if (text.length === 0) {
        vscode.window.showInformationMessage('Please select some code to explain.');
        return;
    }
    return text;
}

function getSymbolCode(document, symbol) {
    // Get the range of the symbol
    const range = new vscode.Range(
        symbol.range.start.line,
        symbol.range.start.character,
        symbol.range.end.line,
        symbol.range.end.character
    );

    // Get the text within this range
    return document.getText(range);
}

async function analyzeCode(code) {
    let prompt = `
    Analyze the following code and provide an explanation in Markdown format. Your response should follow this exact structure:

\`\`\`markdown
## Overview
...

## Variables
...

## Functions
...

## Purpose
The overall purpose of this code seems to be \${}
\`\`\`

- Overview: Provide a brief, high-level description of what the code does.
- Variables: List and explain each variable used in the code. Include their types (if apparent) and their roles.
- Functions: Describe each function in the code, including its parameters, what it does, and what it returns.
- Purpose: Infer and state the overall purpose or goal of this code.

Be concise but thorough in your explanations. Use proper Markdown formatting, including code blocks where appropriate.

Here is the code to analyze:

\`\`\`
${code}
\`\`\`
    `;

    const groq = new Groq({ apiKey: apiKey });
    return await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama3-8b-8192",
      });

}

module.exports = {
    activate,
    deactivate
}