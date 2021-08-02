if [[ $(arch) == "x86_64" ]]; then
	wget https://github.com/cdr/code-server/releases/download/v3.11.0/code-server_3.11.0_amd64.deb -O code-server.deb
else
	wget https://github.com/cdr/code-server/releases/download/v3.11.0/code-server_3.11.0_arm64.deb -O code-server.deb
fi