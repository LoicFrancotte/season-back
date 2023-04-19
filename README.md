# Season App Project - API

This project is the backend of a Twitter-like application, developed with Node.js, Express, TypeScript, and MongoDB. It comes with Swagger documentation to help you understand and use the API effectively. Below you will find all the necessary information to get started with this API.

## Database Schema

![Database Schema](https://i.imgur.com/seVmKle.png)

## Table of Contents

- [Documentation](#documentation)
- [Live Application](#live-application)
- [Frontend Repository](#frontend-repository)
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Populating the Database with Fake Data](#populating-the-database-with-fake-data)

## Documentation

The Swagger documentation for this API is available at the following address: 

[Swagger Documentation](https://season-app-hbxam.ondigitalocean.app/swagger)

To test all the routes in the API, you need an access token. Follow these steps to obtain one:

1. Create an account using the `/register` route.
2. After successful registration, you will receive an access token.
3. In Swagger, click on the `Authorize` button at the top right of the page.
4. Paste your access token in the `value` field and click `Authorize`.
5. You can now test all the routes in the API with your authorized token.

Note: The access token may expire after a certain period of time. If that happens, you will need to log in again using the `/login` route to obtain a new token.

## Live Application

You can try the live application at the following address:
[Incoming]()

## Frontend Repository

The frontend source code is located in the following repository: 
[Frontend Repository](https://github.com/Onllsan/Season)

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
- Faker.js for generating fake data
- Multer for handling profile picture uploads


## Installation

1. Clone this repository

2. Install dependencies:

- `npm install`

3. Copy the `.env.example` file as `.env` and configure the environment variables according to your needs.

4. Start the server:

- `npm run dev`

## Populating the Database with Fake Data

To populate the database with fake data using the `faker.js` script, follow these steps:

1. Build the project:

- `npm run build`

2. Navigate to the `dist` directory:

- `cd dist`

3. Run the `seedDatabase.js` script:

- `node seedDatabase.js`