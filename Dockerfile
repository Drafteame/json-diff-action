FROM node:20

COPY . /action
WORKDIR /action

RUN npm install --production

ENTRYPOINT ["node", "/action/index.js"]