import { CanActivate, ExecutionContext, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { UsersService } from "../services";

@Injectable()
export class EmailConfirmedGuard implements CanActivate
{
    constructor(private userService:UsersService){}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        return new Promise<boolean>(async (resolve,reject)=>{
            const request = context.switchToHttp().getRequest();
            const response = context.switchToHttp().getResponse();

            let user=await this.userService.findByField({"email":request.user.email});
            if(user && user.length>0 && user[0].emailConfirmed) return resolve(true);
            return response.status(HttpStatus.FORBIDDEN).json({
                statusCode:HttpStatus.FORBIDDEN,
                error:"EmailConfirmedForbidden",
                message:["account email is not confirmed"]
            })
            // return reject(false);
        })

    }

}