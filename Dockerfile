# ---- Base image ----
FROM node:8.12.0-slim AS base
ENV WORKDIR /usr/src/app
WORKDIR ${WORKDIR}
COPY package.json yarn.lock ./
RUN yarn install \
    --ignore-scripts \
    --production

# ---- Build image ----
# Yarn will install the missing dev dependencies
# then the bundles are created
FROM base as build
RUN yarn install \
    && node node_modules/node-sass/scripts/install.js
COPY . .
RUN yarn build

FROM base as runtime
COPY --from=build $WORKDIR/app ./app
COPY --from=build $WORKDIR/config ./config
COPY --from=build $WORKDIR/dist ./dist
COPY --from=build $WORKDIR/locale ./locale
COPY --from=build $WORKDIR/public ./public
COPY --from=build $WORKDIR/views ./views
COPY --from=build $WORKDIR/server.js ./
EXPOSE 3000
CMD [ "npm", "start" ]
