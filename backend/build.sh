#!/bin/sh
BUILD_ARGS=""
if [ -n "$VERSION" ]; then
    BUILD_ARGS="$BUILD_ARGS -Dapp.build.version=$VERSION"
fi
if [ -n "$DEV" ]; then
    BUILD_ARGS="$BUILD_ARGS -Dapp.build.dev=$DEV"
fi
if [ -n "$PUBLIC_PATH" ]; then
    BUILD_ARGS="$BUILD_ARGS -Dapp.public.path=$PUBLIC_PATH"
fi
./mvnw clean package -Dmaven.test.skip=true -Dpmd.language=en $BUILD_ARGS
docker build -t higress-console:0.0.1 -f Dockerfile .