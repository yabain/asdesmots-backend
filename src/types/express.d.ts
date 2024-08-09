import { JwtPayload } from './jwt-payload.interface';

declare module 'express-serve-static-core' {
  interface Request {
    authUser?: JwtPayload; // Ajoutez le type approprié pour 'user'
  }
}