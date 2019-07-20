# Resize image with Lambda + ApiGateway and S3

Resize image on the fly using Sharp npm module.

## Installation

Run these following command. You must need to install sharp with `linux` as follows if you are on Windows or macOS

```sh
npm install
rm -rf node_modules/sharp
npm install --arch=x64 --platform=linux --target=8.10.0 sharp
```

## Calling API

Send `key=/{widthxheight}/{photo-name-with-extension}` as query parameter of generated api endpoint.
