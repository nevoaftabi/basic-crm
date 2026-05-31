# Dockerfile: a recipe for building a docker image. 
# The image is a packaged snapshot of your app and everything it needs to run

# Starts from an existing image containing Node.js 22 and alpine. Alpine is a smaller Linux distro
FROM node:22-alpine

# Selects /app inside the image
WORKDIR /app

# Copy the matching package*.json into /app
COPY package*.json ./

# Better than npm install because it doesn't update the lockfile
RUN npm ci

# Copies your project files from your computer into the /app inside the image
COPY . .

# Generates your prisma client based on prisma/schema.prisma
RUN npx prisma generate

# Runs the script from package.json
RUN npm run build

# Documents that the app expects to listen on port 3000
EXPOSE 3000

# Sets the default command that runs when a container starts
CMD ["npm", "start"]

# docker build -t basic-crm-api .
# docker build : create an image
# -t basic-crm-api : name the image
# . : use the current folder as the build context

# docker images : confirm that the image exsits

# Run a container from it
# docker run --name basic-crm-api

# docker run --name basic-crm-api --env-file .env -p 3001:3000 basic-crm-api
# uses port 3001 because your local dev server may already be using 3000