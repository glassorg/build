# build
Contains common build and deployment scripts.

## Dependencies
Yarn

## Windows Setup

Follow the instructions here to setup node on an Ubuntu subsystem:
https://gist.github.com/noygal/6b7b1796a92d70e24e35f94b53722219

Also install python:

    sudo apt install python

## Setup

    git clone https://github.com/glassorg/build.git
    cd build
    yarn setup
    (sudo yarn setup) if Linux

## Usage
Run "guild" to display a list of available commands.

    guild

Some guild commands can take a single JSON formatted parameter.

If it's a string or object then escape the json format with single ticks. For instance

    guild webpack '"debug"'
