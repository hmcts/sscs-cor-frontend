# ---- Base image ----
FROM hmctspublic.azurecr.io/base/node:12-alpine as base

COPY --chown=hmcts:hmcts . .

RUN yarn install && yarn build && node node_modules/node-sass/scripts/install.js && rm -r node_modules/ && yarn install --production && rm -r ~/.cache/yarn

USER hmcts
EXPOSE 3000
