require("dotenv").config();

export const API_URL = process.env.API_URL || 'throw';
export const TOKEN = process.env.TOKEN || 'throw';
export const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'throw';

