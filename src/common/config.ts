import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(__dirname, '../../.env')
});

export const PORT = process.env.PORT || "8080";
export const NODE_ENV = process.env.NODE_ENV || 'production';
export const GAME_HOST = process.env.GAME_HOST;
