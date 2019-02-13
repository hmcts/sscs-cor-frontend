# ---- Base image ----
FROM hmcts.azurecr.io/hmcts/base/node/stretch-slim-lts-8:latest AS base
COPY package.json yarn.lock ./
RUN yarn install \
    --ignore-scripts \
    --production

# ---- Build image ----
FROM base as build
RUN yarn install \
    && node node_modules/node-sass/scripts/install.js
COPY . .
RUN yarn build \
    && rm -rf node_modules

FROM base as runtime
COPY --from=build $WORKDIR .
EXPOSE 3000
