FROM node:10.15.3

RUN npm config set strict-ssl false

# install npm dependencies
WORKDIR /app
COPY ./package.json /app/package.json
RUN npm install && npm cache clear --force

# copy the code source
# after dependencies installation
COPY . /app

# ezmasterification
# see https://github.com/Inist-CNRS/ezmaster
# (no data directory)
# http port is not used
RUN echo '{ \
  "httpPort": 50197, \
  "configPath": "/app/config.json" \
}' > /etc/ezmaster.json

# run the application
CMD ["npm", "start"]

EXPOSE 50197
EXPOSE 27779
