#!/bin/bash

cd modules
for D in `find . -maxdepth 1 -not -path "." -not -path "./.*" -type d`
do
    cd $D
    npm run build:docs
    cd ..
done
cd ..

cd services
for D in `find . -maxdepth 1 -not -path "." -not -path "./.*" -type d`
do
    cd $D
    npm run build:docs
    cd ..
done
cd ..
