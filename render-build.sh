#!/usr/bin/env bash
# Exit on error
set -o errexit

npm install

# Ép tải Chrome vào đúng thư mục cache của Render
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer npx puppeteer browsers install chrome
