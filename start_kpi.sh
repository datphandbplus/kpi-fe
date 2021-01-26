#!/bin/bash
sudo fuser -k 3001/tcp &
sudo fuser -k 80/tcp &
sudo fuser -k 443 &
node /home/datphan/Public/working/kpi/kpi-assessment/dist/src/index.js &
cd "/home/datphan/Public/working/kpi/kpi-fe/dist/my-app" &&
http-server --host 192.168.1.153 --port 443 -S -C "/home/datphan/Public/working/kpi/dbplus.com.vn.crt" -K "/home/datphan/Public/working/kpi/dbplus.com.vn.key" &



