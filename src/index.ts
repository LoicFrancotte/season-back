import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';

import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import likesRoutes from './routes/likesRoutes';
import subscribeRoutes from './routes/subscribeRoutes';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`), // .env.development || .env.test
    debug: true,
    override: true
  })
} else {
  dotenv.config({
    path: path.join(__dirname, `../.env`),
    override: true
  })
}

// console.log('DB_URL', process.env.DB_URL);
// console.log('ENVIRONMENT', process.env.ENVIRONMENT);
// console.log('FRONTEND_URL', process.env.FRONTEND_URL);
// console.log('BACKEND_URL', process.env.BACKEND_URL);

const app = express();

// Configurer les options CORS
const corsOptions = {
  origin: 'https://editor.swagger.io',
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

app.use(express.json());
app.use(cors(corsOptions));

app.use('/', userRoutes);
app.use('/', postRoutes);
app.use('/', commentRoutes);
app.use('/', likesRoutes);
app.use('/', subscribeRoutes)

app.use(
  session({
    secret: process.env.SESSION_SECRET || '1G2G3G4G5G6G7G8G9G10G',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  }),
);

const PORT: number = Number(process.env.PORT);

mongoose.connect(process.env.DB_URL!);

mongoose.connection.on('error', (error: string) => {
  console.error(error);
});

mongoose.connection.once('open', () => {
  console.log('🌱 Connected to MongoDB');

  app.listen(PORT, () => {
    console.log(`🚀 Server ready on port ${PORT}`);
  });
});

export default app;