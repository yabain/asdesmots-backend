import { ExecutionContext, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class UserJwtAuthGuard extends AuthGuard('jwt'){
    handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
        if (err || !user) {
            throw err || new UnauthorizedException({
                statusCode:HttpStatus.UNAUTHORIZED,
                error:'Authentification error',
                message:[info.message]
            });
          }
        return user;        
    }
}