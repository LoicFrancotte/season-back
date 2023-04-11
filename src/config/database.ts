import mongoose from 'mongoose';

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.DB_URL!);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
};

export const disconnectFromDatabase = async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error disconnecting from the database:', error);
  }
};

// fichier pour les tests des routes
