# Library Content Management with Node.js, MongoDB, and RabbitMQ

This project extends a Node.js/Express API to handle library content uploads (e.g., PDF files, eBooks, and other documents) and process additional metadata or previews via an offline workflow using RabbitMQ. It demonstrates how to:

- Integrate file uploads into an Express-based API.
- Store digital content in the server’s filesystem.
- Manage content metadata in MongoDB.
- Use a background worker (RabbitMQ consumer) to generate and store previews or additional metadata offline.

---

## Key Features

1. **Multipart Library Content Uploads**  
   - Accepts various file formats (e.g., PDF, EPUB) via a `POST /contents` endpoint.  
   - Validates and rejects unsupported file types.  
   - Stores file metadata (e.g., `bookId`, `description`) in MongoDB.

2. **Content Storage & Retrieval**  
   - Persists uploaded files in the server’s filesystem with an appropriate extension.  
   - Returns download URLs (e.g., `/media/contents/{filename}.pdf`) so clients can retrieve the original files.  

3. **Offline Metadata/Preview Generation**  
   - Publishes a message to a RabbitMQ queue each time a new file is uploaded.  
   - A separate RabbitMQ consumer reads the queue, processes the file (e.g., creating a preview image, extracting text snippets), and stores the resulting preview in a separate directory.  
   - The consumer updates the original content record in MongoDB with the new preview’s URL.

4. **Scalable Microservices Architecture**  
   - Uses RabbitMQ to decouple the main API server from heavy processing tasks.  
   - Multiple consumer instances can be run in parallel for scalability.  
   - All metadata is stored in MongoDB for quick lookups, even as the system grows.

5. **Docker & Docker Compose** (Optional Enhancement)  
   - A single command (`docker-compose up`) can spin up the entire system: API server, MongoDB, RabbitMQ, and the consumer.  
   - Includes potential health checks and volume-sharing configurations.

---

## Technologies & Tools

- **Node.js / Express** – Core API server  
- **MongoDB** – Metadata storage  
- **RabbitMQ** – Asynchronous job queue  
- **Docker & Docker Compose** – Containerization and orchestration  
- **Libraries for Document/Media Processing** (e.g., [Sharp](https://www.npmjs.com/package/sharp), [Jimp](https://www.npmjs.com/package/jimp), PDF parsing libraries) for preview generation

---

## Overview of Workflow

1. **Upload Content**  
   - Clients send a `POST /contents` request with multipart form-data (including file and metadata fields).  
   - The API validates the file type, stores it locally, and saves its metadata (including the download URL) in MongoDB.

2. **Publish Task to Queue**  
   - After successfully saving the file, the API sends a message to RabbitMQ.  
   - The message contains necessary details (e.g., document ID) for further processing.

3. **Generate Preview/Extract Metadata**  
   - A separate RabbitMQ consumer process monitors the queue.  
   - Once a task is received, it reads the file from local storage and processes it:
     - Generates a preview (e.g., cover image) or  
     - Extracts relevant metadata/text.  
   - The consumer saves the generated file (if any) in a separate directory and updates the original content record in MongoDB with the preview’s URL or metadata.

4. **Retrieve Content & Previews**  
   - A `GET /contents/{id}` endpoint returns the record with both the original file and any associated preview URLs.  
   - Clients can download the files directly via these URLs.

---

## Getting Started

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/your-username/library-content-management.git
   cd library-content-management
