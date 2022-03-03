FROM node:16-alpine

WORKDIR /srcs

VOLUME [ "/srcs" ]

RUN apk update && apk upgrade && apk add bash

RUN npm install -g @angular/cli 

ENTRYPOINT cd /srcs/front && npm i && ng build && cd /srcs/back && npm i && npm run start:build