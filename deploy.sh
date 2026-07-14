#!/usr/bin/env bash
set -e

cd ~/stocktraders_sub

git pull origin master
npm run build

sudo rm -rf /var/www/landing/*
sudo cp -r dist/* /var/www/landing/
sudo chown -R www-data:www-data /var/www/landing

echo "Deploy done: https://landing.stocktradersai.vn/ra-mat-web-2026"