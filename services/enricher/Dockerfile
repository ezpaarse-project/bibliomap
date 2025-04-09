FROM node:10.15.3

RUN npm config set strict-ssl false

# install npm dependencies
WORKDIR /app
COPY ./package.json /app/package.json
RUN yarn install && yarn cache clean

# copy the code source
# after dependencies installation
COPY . /app

# ezmasterification of ezpaarse2log.io
# see https://github.com/Inist-CNRS/ezmaster
# (no data directory)
# http port is not used
RUN echo '{ \
  "httpPort": 3000, \
  "configPath": "/app/config/default.json" \
}' > /etc/ezmaster.json

# run the application
CMD ["npm", "start"]
