#!/bin/bash

ENV_FILE="test.env"
SCRIPT_DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)

# Setting env variables
printf "\nSetting env variables..."
if [ ! -f .env ]
then
  # shellcheck disable=SC2046
  export $(xargs -a "$SCRIPT_DIR/$ENV_FILE")
fi

# Checking for docker
printf "\nChecking for docker...";
docker -v > /dev/null 2>&1
DOCKER_EXISTS=$?
if [ "$DOCKER_EXISTS" -ne 0 ]; then
    printf "\nDocker not found. Terminating setup."
    exit 1
fi

# Pulling latest mongodb image
printf "\nPulling latest mongodb image..."
docker pull mongo:latest > /dev/null 2>&1

# Starting the mongodb container
printf "\nStarting the mongodb container..."
CONTAINER_EXISTS=$(docker ps -a -q -f name="$MONGODB_CONTAINER")
if [ "$CONTAINER_EXISTS" ]; then
    docker rm -f "$MONGODB_CONTAINER" > /dev/null
fi
docker run --name "$MONGODB_CONTAINER" -p "$MONGODB_PORT":27017 -d mongo:latest > /dev/null

# Mongodb container has started
printf "\n\nStatus: Mongodb container has started."
# shellcheck disable=SC2059
printf "\nInstance url: mongodb://$MONGODB_HOST:$MONGODB_PORT/$MONGODB_DATABASE"
printf "\nTo run the test suite: npm test\n\n"
