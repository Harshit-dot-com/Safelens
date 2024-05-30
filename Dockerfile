# Use the official Node.js image from the Docker Hub as the base image
FROM node:14
# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY app/package*.json ./

# Install app dependencies

RUN npm install

# Copy the rest of the application code to the working directory
COPY app ./

# Expose port 3000 to the outside world
EXPOSE 3000

# Command to run the application
CMD ["node", "index.js"]
