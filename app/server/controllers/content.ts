import { NextFunction, Request, Response } from 'express';

const content = require('../../../locale/content');
const i18next = require('i18next');

export const tyaNunjucks = {
  nunjucksEnv: null,

  get env() {
    if (!this.nunjucksEnv) {
      throw Error('The nunjucks environment has not been set.');
    }
    return this.nunjucksEnv;
  },

  set env(env) {
    this.nunjucksEnv = env;
  },
};

export function renderContent(content, placeholder) {
  if (Array.isArray(content)) {
    content.forEach((str) => renderContent(str, placeholder));
  }
  if (typeof content === 'object') {
    const newKeys = Object.keys(content).map((key) => {
      return { [key]: renderContent(content[key], placeholder) };
    });
    return Object.assign({}, ...newKeys);
  }
  if (typeof content === 'string') {
    return tyaNunjucks.env.renderString(content, placeholder);
  }
  return null;
}

export function emailNotifications(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = res.locals.token;
  const placeholder = { benefitType: token.benefitType };
  const notificationsContent = content[i18next.language].notifications;
  content[i18next.language].notifications = renderContent(
    notificationsContent,
    placeholder
  );

  next();
}
