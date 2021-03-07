#!/bin/sh

current_folder=`pwd`

if [ -f "$current_folder/Gemfile" ]; then
  cd $current_folder/public
  rm -rf frontend
  yarn run build

  application_file=`ls -A1 "$current_folder/public/frontend" | grep application-`
  echo $application_file > "$current_folder/config/webpack/pointers/appjs.txt"

  exit 0
fi

echo "current dir is incorrect"
exit 1
