'use strict';

const husky = {
  hooks: {
    'pre-push': 'npm run git-pre-push'
  }
};

module.exports = husky;