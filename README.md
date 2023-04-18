# Season App Project - API

This project is the backend of a Twitter-like application, developed with Node.js, Express, and TypeScript. This is my first real API that I've built, and it comes with Swagger documentation. Below you will find all the necessary information to understand and use this API.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [Database Schema](#database-schema)
- [Live Application](#live-application)
- [Frontend Repository](#frontend-repository)
- [Documentation](#documentation)

## Features

- User registration and authentication
- Password reset via email
- Profile management (including profile picture upload)
- Creation, modification, and deletion of tweets
- Commenting on tweets
- Like and unlike system
- Follow and unfollow system
- Generating fake data with faker.js

## Technologies

- Node.js
- Express
- TypeScript
- MongoDB
- Swagger for API documentation
- MailgunJS for sending password reset emails
- faker.js for generating fake data
- Multer for handling profile picture uploads


## Installation

1. Clone this repository:

- `npm install`

2. Copy the `.env.example` file as `.env` and configure the environment variables according to your needs.

3. Start the server:

- `npm run dev` 


## Usage

After starting the server, the API will be accessible at `http://localhost:PORT` (replace `PORT` with the port configured in your `.env` file).

## Database Schema

![Database Schema](https://i.imgur.com/ZXtXfYw.png)

## Live Application

You can try the live application at the following address:
[Incoming]()

## Frontend Repository

The frontend source code is located in the following repository: 
[Frontend Repository](https://github.com/Onllsan/Season)

## Documentation

The Swagger documentation for this API is available at the following address: 
[Swagger Documentation](https://season-app-hbxam.ondigitalocean.app/swagger)
