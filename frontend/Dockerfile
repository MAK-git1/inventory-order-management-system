# Build stage
FROM node:18-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Declare build-time arguments to inject environment variables into compiled static assets
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the production bundle
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage

# Copy Nginx configuration file for SPA fallback routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build files from build-stage to Nginx default html directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
