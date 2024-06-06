# Use the official Node.js image from the Docker Hub as the base image

FROM node:14

# Install Python and pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    apt-get clean

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY app/package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY app ./

# Copy the Python requirements file and install dependencies
COPY app/detection/requirements.txt ./
RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt

# Expose port 3000 to the outside world
EXPOSE 3000

# Command to run the application
CMD ["node", "index.js"]
