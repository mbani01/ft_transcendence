FROM node:16-alpine

WORKDIR /front

VOLUME [ "/front" ]

RUN apk update && apk upgrade && apk add bash

RUN npm install -g @angular/cli 

ENTRYPOINT npm install && ng serve --host=0.0.0.0