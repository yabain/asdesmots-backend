import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common/decorators";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { RolesService } from "../services";
import { PermsValueType, PERMS_KEY } from "../types";

@Injectable()
export class PermsGuard implements CanActivate
{
    constructor(private reflector: Reflector,private rolesService:RolesService){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requirePerms = this.reflector.getAllAndOverride<PermsValueType[]>(PERMS_KEY, [
            context.getHandler(),
            context.getClass()
        ])
        // console.log("perms",requirePerms)
        const { user } = context.switchToHttp().getRequest();
        // console.log("User ",user);
        if(requirePerms.length==0) return true;
        let rolesPerms = await Promise.all(user.roles.map((role)=>this.rolesService.findOneByField({name:role})));
        rolesPerms = rolesPerms.map((role)=> role.permission).reduce((previous,curr)=> [...previous,...curr],[]);
        let canContinue = true;

        // console.log("Role Perms",rolesPerms)
        for (const requireRole of requirePerms) {
            let found = false;
            for (const role of rolesPerms) {
                if(role.name==requireRole.name) 
                {
                    found = true;
                    break;
                }
            }
            if(!found)
            {
                canContinue=false;
                break;
            }
        }
        return canContinue;
    }
    
}