# Dockerfile
FROM node:19
WORKDIR /opt/app

ENV NODE_ENV production
RUN chown -R node:node /opt/app
USER node

ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc

COPY --chown=node:node package*.json ./
RUN npm install

COPY --chown=node:node . /opt/app
RUN npm run lint

RUN npm run build
CMD [ "npm", "run", "start" ]

EXPOSE 3000