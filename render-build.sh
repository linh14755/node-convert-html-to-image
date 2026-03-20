#!/usr/bin/env bash
# Exit on error
set -o errexit

npm install
# Lệnh này cực kỳ quan trọng để Puppeteer tự tải Chrome bản Linux tương thích
npx puppeteer browsers install chrome
