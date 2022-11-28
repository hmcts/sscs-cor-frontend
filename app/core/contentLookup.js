const { Logger } = require('@hmcts/nodejs-logging');
const { get } = require('lodash');
const content = require('../../locale/content');
const i18next = require('i18next');

const logger = Logger.getLogger('contentLookup.js');

const getContentFromFile = (key) => {
  const cont = get(content[i18next.language], key);
  if (!cont) {
    throw new ReferenceError(`Unknown key: ${key}`);
  }
  return cont;
};

const getContentAsString = (key) => {
  let cont = null;
  try {
    cont = getContentFromFile(key);
  } catch (error) {
    logger.error(error);
  }

  return cont;
};

const getContentAsArray = (key) => {
  let cont = getContentAsString(key);

  if (typeof cont === 'string') {
    cont = [cont];
  }

  return cont;
};

module.exports = { getContentFromFile, getContentAsString, getContentAsArray };
