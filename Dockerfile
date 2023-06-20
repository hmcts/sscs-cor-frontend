# ---- Base image ----
FROM hmctspublic.azurecr.io/base/node:16-alpine as base

USER root
RUN corepack enable
RUN corepack prepare yarn@stable --activate

FROM base AS deps

WORKDIR /app
COPY ./package.json .
COPY ./.yarn/plugins ./.yarn/plugins
COPY ./.yarn/releases ./.yarn/releases/
COPY ./.yarnrc.yml .
COPY ./yarn.lock .



FROM base AS builder

WORKDIR /app

COPY . .
COPY --from=deps /app/.yarn ./.yarn/
COPY --from=deps /app/yarn.lock .
RUN yarn install
RUN yarn build

FROM base AS runner

WORKDIR /app

USER hmcts

COPY --from=builder --chown=hmcts:hmcts /app ./
COPY --from=builder --chown=hmcts:hmcts . .

FROM runner AS production

WORKDIR /app
USER hmcts
COPY --from=builder /app/.yarn/plugins .yarn/plugins/
COPY --from=builder /app/.yarnrc.yml .
COPY --from=builder /app/.yarn/releases .yarn/releases/


RUN rm -rf ./.yarn/cache


RUN yarn workspaces focus --all --production

EXPOSE 3000