'use strict';

const nodeVersion = require('./config/node-version');

const babel = {
  comments: false,
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: nodeVersion
        }
      }
    ],
    '@babel/preset-typescript'
  ]
};

module.exports = babel;