module.exports = {
  'extends': [
    'airbnb-base',
    'plugin:promise/recommended'
  ],
  'parserOptions': {
    'ecmaVersion': 9,
    'ecmaFeatures': {
      'jsx': false
    },
    'sourceType': 'module'
  },
  'env': {
    'es6': true,
    'node': true,
    'jest': true
  },
  'plugins': [
    'import',
    'node',
    'promise'
  ],
  'rules': {
    'arrow-parens': 'off',
    'comma-dangle': [
      'error',
      'only-multiline'
    ],
    'func-names': 'off',
    "object-shorthand": 'off',
    "camelcase": 'off',
    "no-trailing-spaces": 'off',
    "complexity": 'off',
    "default-case": 'off',
    "prefer-const": 'off',
    "no-spaced-func": 'off',
    "no-unneeded-ternary": 'off',
    "spaced-comment": 'off',
    "no-multi-spaces": 'off',
    "func-call-spacing": 'off',
    "one-var": 'off',
    "object-curly-newline": 'off',
    "object-curly-spacing": 'off',
    "max-len": ["error", { "code": 1180 }],
    'global-require': 'off',
    'handle-callback-err': [
      'error',
      '^(err|error)$'
    ],
    'import/no-unresolved': [
      'error',
      {
        'caseSensitive': true,
        'commonjs': true,
        'ignore': ['^[^.]']
      }
    ],
    'import/prefer-default-export': 'off',
    'linebreak-style': 'off',
    'no-catch-shadow': 'error',
    'no-continue': 'off',
    'no-div-regex': 'warn',
    'no-else-return': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    "no-case-declarations": 'off',
    'no-shadow': 'off',
    'no-multi-assign': 'off',
    'no-underscore-dangle': 'off',
    'node/no-deprecated-api': 'error',
    'node/process-exit-as-throw': 'error',
    'operator-linebreak': [
      'error',
      'after',
      {
        'overrides': {
          ':': 'before',
          '?': 'before'
        }
      }
    ],
    'prefer-arrow-callback': 'off',
    'prefer-destructuring': 'off',
    'prefer-template': 'off',
    'quote-props': [
      1,
      'as-needed',
      {
        'unnecessary': true
      }
    ],
    'semi': [
      'error',
      'never'
    ]
  },
  'globals': {
    'window': true,
    'document': true,
    'App': true,
    'Page': true,
    'Component': true,
    'Behavior': true,
    'wx': true,
    'getCurrentPages': true,
  }
}
