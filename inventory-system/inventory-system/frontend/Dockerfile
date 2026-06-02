FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --silent

COPY . .

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# Production stage with nginx
FROM nginx:1.25-alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
