/* eslint-disable prettier/prettier */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from 'src/user/services'; 

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.split(' ')[1];
    
    console.log('token',token);

    if (!token) {
      return false;
    }

    const user = await this.authService.validateToken(token);
    console.log('user',user);
    if (!user) {
      return false;
    }

    request.user = user; // Attachez l'utilisateur à la requête
    return true;
  }
}
