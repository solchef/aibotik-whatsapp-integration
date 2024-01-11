import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// models
import UserModel from '../models/User.js';

const SECRET_KEY = 'some-secret-key';

// Declare a module augmentation to extend the Express Request type
declare module 'express-serve-static-core' {
  interface Request {
    authToken?: string;
    userId?: string; // Add userId property
    userType?: string; // Add userType property
  }
}

export const encode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const { userId } = req.params;
    // const user = await UserModel.getUserById(userId);
    // const payload = {
    //   userId: user._id,
    //   userType: user.type,
    // };
    // const authToken = jwt.sign(payload, SECRET_KEY);
    // console.log('Auth', authToken);
    // req.authToken = authToken;
    next();
  } catch (error:any) {
    return res.status(400).json({ success: false, message: error.error });
  }
};

export const decode = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers['authorization']) {
    return res.status(400).json({ success: false, message: 'No access token provided' });
  }
  const accessToken = req.headers.authorization.split(' ')[1];
  try {
    const decoded: any = jwt.verify(accessToken, SECRET_KEY); // Use 'any' or define a type for 'decoded'
    req.userId = decoded.userId;
    req.userType = decoded.type;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: error });
  }
};
