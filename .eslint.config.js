module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:prettier/recommended'
    ],
    plugins: ['@typescript-eslint', 'react'],
    rules: {
        'prettier/prettier': ['warn', { singleQuote: false }],
        'camelcase': 'warn',
        'prefer-const': 'warn',
        'no-var': 'warn',
        'no-console': 'warn', // Changed to 'warn' to treat console statements as warnings
        'no-duplicate-imports': 'warn',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-explicit-any': 'warn', // Added to treat 'any' usage as a warning
        '@typescript-eslint/no-unused-expressions': 'warn', // Added to treat unused expressions as warnings
        '@typescript-eslint/no-empty-object-type': 'warn', // Warn on empty object types, but not an error
        '@typescript-eslint/no-empty-function': 'warn', // Added to treat empty functions as warnings
        '@typescript-eslint/no-empty-interface': 'warn', // Added to treat empty interfaces as warnings
        'react/jsx-indent': ['warn', 4],
        'react/jsx-indent-props': ['warn', 4],
        'react-hooks/exhaustive-deps': 'off',
        'react/react-in-jsx-scope': 'warn', // Treat React in JSX scope as a warning
        '@next/next/no-img-element': 'off',
        'react/jsx-key': 'off',
        'react/prop-types': 'warn', // Treat missing prop-types as warnings
        'no-useless-catch': 'warn', // Turn the no-useless-catch rule into a warning
        'no-useless-escape': 'warn', // Turn the no-useless-escape rule into a warning
        'no-case-declarations': 'warn' // Turn the no-case-declarations rule into a warning
    },
    settings: {
        react: {
            version: 'detect'
        }
    },
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 12,
        sourceType: 'module'
    }
};
