const { Logger } = require('@hmcts/nodejs-logging');
const { get } = require('lodash');
const locale = require('../../locale/en');

const logger = Logger.getLogger('contentLookup.js');

const getContentFromFile = key => {
  const content = get(locale, key);
  if (!content) {
    throw new ReferenceError(`Unknown key: ${key}`);
  }
  return content;
};

const getContentAsString = key => {
  let content = null;
  try {
    content = getContentFromFile(key);
  } catch (error) {
    logger.error(error);
  }

  return content;
};

const getContentAsArray = key => {
  let content = getContentAsString(key);

  if (typeof content === 'string') {
    content = [content];
  }

  return content;
};

module.exports = { getContentFromFile, getContentAsString, getContentAsArray };
