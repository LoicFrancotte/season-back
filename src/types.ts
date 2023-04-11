import { Session } from 'express-session';
import { Request } from 'express';

declare module 'express' {
  export interface Request {
    user?: any;
  }
}

declare module 'express-session' {
  interface Session {
    userId: string;
  }
}
