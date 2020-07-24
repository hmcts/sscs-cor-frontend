const { Logger } = require('@hmcts/nodejs-logging');
const { get } = require('lodash');
const content = require('../../locale/content');

const logger = Logger.getLogger('contentLookup.js');

const getContentFromFile = key => {
  const cont = get(content.en, key);
  if (!cont) {
    throw new ReferenceError(`Unknown key: ${key}`);
  }
  return cont;
};

const getContentAsString = key => {
  let cont = null;
  try {
    cont = getContentFromFile(key);
  } catch (error) {
    logger.error(error);
  }

  return cont;
};

const getContentAsArray = key => {
  let cont = getContentAsString(key);

  if (typeof cont === 'string') {
    cont = [cont];
  }

  return cont;
};

module.exports = { getContentFromFile, getContentAsString, getContentAsArray };
