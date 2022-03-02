FROM node:16-alpine

WORKDIR /SRCS

VOLUME [ "/SRCS" ]

RUN apk update && apk upgrade && apk add bash

RUN npm install -g @angular/cli 

ENTRYPOINT cd /SRCS/front && npm i && ng build && cd /SRCS/back && npm i && npm run start:build