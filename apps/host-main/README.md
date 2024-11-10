# host-main

This is a simple microservice application built with Node.js that exposes several HTTP endpoints and communicates with gRPC services. Here's what it does:

## Core Functionality

- Creates an HTTP server running on port 50050
- Implements CORS support for cross-origin requests
- Uses micro framework for handling HTTP requests
- Integrates with gRPC services for backend communication

## Endpoints

1. **Root Endpoint (`/`)**
   - Returns a simple "Hello world111" message
   - Method: GET

2. **API Endpoints**
   - `/api/v1/foo`: Executes gRPC service with "foo" data
   - `/api/v1/bar`: Executes gRPC service with "bar" data
   - `/api/v1/baz`: Executes gRPC service with "baz" data
   - All return gRPC service responses
   - Method: GET for all

3. **Static File Serving**
   - Handles all other routes (`/*`)
   - Serves static files from the `./public` directory

## Technical Details

- Uses the `remote-grpc` module for gRPC communication
- Implements logging through `loggerService` with "host-main" prefix
- All API endpoints use the same underlying gRPC service (`fooClientService.Execute`)
- Includes full CORS configuration for API access

This appears to be a gateway service that bridges HTTP requests to gRPC backend services, while also serving static content.
