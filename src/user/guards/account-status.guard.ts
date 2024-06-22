import { CanActivate, ExecutionContext, ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JsonResponse } from 'src/shared/helpers/json-response';
import { UsersService } from '../services';

@Injectable()
export class AccountStatusGuard implements CanActivate {
  constructor(private readonly userService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    let email = request?.body?.email ?? response?.body?.email ?? response?.data?.user.email;
    let user = await this.userService.findOneByField({"email":email});
    if(user && user.isDisabled) { 
      throw new ForbiddenException('Account Disabled. Contact Support.');
    }  
    return true;
  }

}
