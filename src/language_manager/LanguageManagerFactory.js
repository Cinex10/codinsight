const PythonLanguageManager = require('./PythonLanguageManager');

class LanguageManagerFactory {
    static getLanguageManager(languageId) {
        switch (languageId) {
            case 'python':
                return new PythonLanguageManager();
            // Add more language managers here as needed
            default:
                throw new Error(`Unsupported language: ${languageId}`);
        }
    }
}

module.exports = LanguageManagerFactory;