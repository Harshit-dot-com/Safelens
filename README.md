# Safelens - Noble Vision

Safelens is a video calling application built using WebRTC technology, primarily leveraging Node.js and EJS. It facilitates one-on-one video calls while incorporating a unique feature to detect explicit content shared between users in real-time.

## How it Works

Safelens integrates a content monitoring system that periodically captures screenshots of users' web browsers during video calls. These screenshots are then analyzed using a Python child process to detect explicit content. If such content is detected, appropriate actions can be taken to ensure a safe and secure communication environment.

## Usage

To run Safelens locally, follow these steps:

1. Clone the repository:

   ```
   git clone https://github.com/Harshit-dot-com/Safelens.git
   ```

2. Navigate to the project directory:

   ```
   cd safelens
   ```

3. Build the Docker image:

   ```
   docker build -t safelens .
   ```

4. Run the Docker container:

   ```
   docker run -p 3000:3000 safelens
   ```

5. Access the application in your web browser at:

   ```
   http://localhost:3000
   ```

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for any enhancements or bug fixes you'd like to propose.

## License

This project is licensed under the [MIT License](LICENSE).
