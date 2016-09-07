#!/bin/bash
echo fs.inotify.max_user_watches=100000 | tee -a /etc/sysctl.conf; sysctl -p
ln -fs /usr/share/zoneinfo/Asia/Kolkata /etc/localtime
cd /app
npm install 
npm install -g nodemon
nodemon
