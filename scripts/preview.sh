set -ex;

rm -r ./dist
npm run build
mv ./dist/src/server/index.js ./dist
rm -r ./dist/src

NODE_ENV=production node ./dist/index.js
