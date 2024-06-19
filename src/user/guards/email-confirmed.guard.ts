import { CanActivate, ExecutionContext, Injectable, NotAcceptableException } from "@nestjs/common";
import { UsersService } from "../services";

@Injectable()
export class EmailConfirmedGuard implements CanActivate {
    constructor(private readonly userService: UsersService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        
        const email = request?.body?.email ?? response?.body?.email ?? response?.data?.user.email;
        const user = await this.userService.findOneByField({"email":email});
        if(user && !user.emailConfirmed) { 
            throw new NotAcceptableException('Account email is not confirmed.');
        }  
        return true;
    }
}
