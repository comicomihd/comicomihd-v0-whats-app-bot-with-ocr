FROM node:18-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y \
    chromium-browser \
    chromium-common \
    libx11-6 \
    libx11-dev \
    libxrandr2 \
    libxinerama1 \
    libxi6 \
    libxtst6 \
    libxcursor1 \
    libxss1 \
    libasound2 \
    libpangox-1.0-0 \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    fonts-liberation \
    libappindicator3-1 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf1.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango1.0-0 \
    libpixman-1-0 \
    libstdc++6 \
    libx11-xcb1 \
    libxcb1 \
    libxext6 \
    libxfixes3 \
    libxrender1 \
    libgbm1 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY bot.ts webhook.ts tsconfig.json ./

RUN npm run build

RUN mkdir -p /app/data

EXPOSE 3001

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

CMD ["npm", "start"]
