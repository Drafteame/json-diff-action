FROM node:20-alpine

LABEL "com.github.actions.icon"="blue"
LABEL "com.github.actions.color"="database"
LABEL "com.github.actions.name"="json-diff-action"
LABEL "com.github.actions.description"="Check for differences between at least 2 json files and show what member is missing by each file."
LABEL "org.opencontainers.image.source"="https://github.com/Drafteame/json-diff-action"

COPY . /action
WORKDIR /action

RUN npm install --omit=dev

ENTRYPOINT ["node", "/action/index.js"]