FROM node:8.12.0-slim

RUN apt-get update && apt-get install -y git

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY yarn.lock ./

RUN yarn install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .
RUN yarn build

EXPOSE 3000
CMD [ "npm", "start" ]