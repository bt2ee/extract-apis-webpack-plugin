'use strict';

const lintStaged = {
  '*.{js,ts,json,md}': ['prettier --write', 'git add']
};

module.exports = lintStaged;