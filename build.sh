#!/bin/sh

cd ./raycasting-engine-go
GOOS=js GOARCH=wasm go build -o ../static/wasm/raycasting.wasm .
cd ..
