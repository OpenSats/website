module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(react-markdown|vfile|vfile-message|unified|bail|is-plain-obj|trough|remark-parse|mdast-util-from-markdown|micromark|decode-named-character-reference|character-entities|markdown-table|zwitch|unist-util-stringify-position|mdast-util-to-string|space-separated-tokens|comma-separated-tokens|hast-util-whitespace|property-information|hast-util-to-jsx-runtime|devlop|unist-util-visit|unist-util-is|unist-util-position|unist-builder|mdast-util-to-hast|mdast-util-definitions|unist-util-generated|unist-util-position|unist-util-visit|mdast-util-to-string)/)',
  ],
} 