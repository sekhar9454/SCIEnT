FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
ENV DISABLE_ESLINT_PLUGIN=true
ENV CI=false

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

# Serve the SPA: unknown paths fall back to index.html for React Router;
# hashed static assets are cached long-term
RUN printf '%s\n' \
  'server {' \
  '    listen 3000;' \
  '    root /usr/share/nginx/html;' \
  '    location /static/ {' \
  '        expires 1y;' \
  '        add_header Cache-Control "public, immutable";' \
  '    }' \
  '    location / {' \
  '        index index.html;' \
  '        try_files $uri $uri/ /index.html;' \
  '    }' \
  '}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
