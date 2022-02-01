FROM node:16-alpine

WORKDIR /back

VOLUME [ "/back" ]

RUN apk update && apk upgrade && apk add bash

ENTRYPOINT npm install && npm run start