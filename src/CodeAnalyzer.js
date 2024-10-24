const dotenv = require('dotenv');
const path = require('path');


class CodeAnalyzer {
    constructor(context) {
        const rootPath = context.extensionPath;
        dotenv.config({ path: path.join(rootPath, '.env') });
        this.endpoint = process.env.EXPLAIN_ENDPOINT;
    }

    async analyzeCode(code) {
        const prompt = `
            Analyze the following code and provide an explanation in Markdown format. Your response should follow this exact structure:

            ## Overview
            ...

            ## Variables
            ...

            ## Functions
            ...

            ## Purpose
            The overall purpose of this code seems to be \${}

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

            const response = await fetch(this.endpoint, 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                      },
                    body: JSON.stringify({
                        prompt: prompt
                      })
                });
            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data['completion'];

    }
}

module.exports = CodeAnalyzer;