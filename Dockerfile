# ---- Base image ----
FROM hmctspublic.azurecr.io/base/node:18-alpine as base

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

USER root
RUN corepack enable
USER hmcts

COPY --chown=hmcts:hmcts .yarn ./.yarn
COPY --chown=hmcts:hmcts config ./config
COPY --chown=hmcts:hmcts package.json yarn.lock .yarnrc.yml ./

RUN yarn workspaces focus --all --production && yarn cache clean

# ---- Build image ----
FROM base as build
COPY --chown=hmcts:hmcts . ./
RUN yarn install
RUN yarn build

EXPOSE 3003
