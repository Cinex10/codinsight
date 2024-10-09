const Groq = require('groq-sdk');
const dotenv = require('dotenv');
const path = require('path');


class CodeAnalyzer {
    constructor(context) {
        const rootPath = context.extensionPath;
        dotenv.config({ path: path.join(rootPath, '.env') });
        this.apiKey = process.env.LLM_API_KEY;
        this.groq = new Groq({ apiKey: this.apiKey });
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

        const response = await this.groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama3-8b-8192",
        });

        return response['choices'][0]['message']['content'];
    }
}

module.exports = CodeAnalyzer;