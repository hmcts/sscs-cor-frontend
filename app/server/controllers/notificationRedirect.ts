import { NextFunction, Request, Response } from 'express';
import content from '../../common/locale/content.json';

import i18next from 'i18next';

import { BAD_REQUEST } from 'http-status-codes';

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
      res.status(BAD_REQUEST);
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
