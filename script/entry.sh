#!/bin/bash

if [[ -d "~/.vscode/machineid" ]]; then
	echo "Skiping code folder copy!"
else
	cp ~/.local/share/code-server/* ~/.vscode/. -rfv
fi

code-server -vvv --bind-addr 0.0.0.0:8080 --auth none --user-data-dir ~/.vscode