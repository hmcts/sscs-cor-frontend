import { NextFunction, Request, Response } from 'express';

const HttpStatus = require('http-status-codes');
const content = require('../../../locale/content');
const i18next = require('i18next');

enum requestType {
  changeEmail,
  stopEmail,
}

export function notificationRedirect(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  switch (req.body.type) {
    case requestType.changeEmail:
      res.redirect(`/manage-email-notifications/${req.params.mactoken}/change`);
      break;
    case requestType.stopEmail:
      res.redirect(`/manage-email-notifications/${req.params.mactoken}/stop`);
      break;
    default:
      res.status(HttpStatus.BAD_REQUEST);
      res.render('manage-emails.njk', {
        mactoken: req.params.mactoken,
        fields: {
          error: true,
          noSelection: {
            errorHeading:
              content[i18next.language].notifications.email.errors
                .selectAnOptionHeading,
            errorMessage:
              content[i18next.language].notifications.email.errors
                .selectAnOptionField,
          },
        },
      });
  }

  next();
}
