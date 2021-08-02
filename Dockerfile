FROM debian

RUN apt update
RUN apt install wget curl npm nodejs git -y

COPY . /thebot-ext

WORKDIR /thebot-ext

RUN /bin/bash ./script/download.sh
RUN dpkg -i code-server.deb

RUN npm install; npm run pack; code-server --install-extension thebot-0.0.1.vsix

ENV SERVICE_URL=https://marketplace.visualstudio.com/_apis/public/gallery
ENV ITEM_URL=https://marketplace.visualstudio.com/items

RUN code-server --install-extension VisualStudioExptTeam.vscodeintellicode
RUN code-server --install-extension Endormi.2077-theme
RUN code-server --install-extension streetsidesoftware.code-spell-checker
RUN code-server --install-extension tinkertrain.theme-panda
RUN code-server --install-extension CoenraadS.bracket-pair-colorizer
RUN code-server --install-extension oderwat.indent-rainbow
RUN code-server --install-extension eamodio.gitlens
RUN code-server --install-extension ysemeniuk.emmet-live
RUN code-server --install-extension CharlieGerard.pride-vscode-themes

ENTRYPOINT [ "/thebot-ext/script/entry.sh" ]
