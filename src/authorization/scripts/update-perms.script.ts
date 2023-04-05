import { Injectable } from "@nestjs/common";
import { Command } from "nestjs-command";
import { getPermsAsArray } from "../enums/perms.enum";
import { PermissionsService, RolesService } from "../services";

@Injectable()
export class UpdatePermsScript
{
    constructor(private permsService:PermissionsService){}

    @Command({
        command: 'update:perms',
        describe:"mise a jour de la liste des permissions"
    })
    async updateScript(passedParams: string[], options?: Record<string, any>)
    {
        return this.permsService.executeWithTransaction(async (session)=>{
            let permsList = getPermsAsArray();
            for (const perms of permsList) {

                let existedPerms = await this.permsService.findOneByField({name:perms.name})
                if(!existedPerms) await this.permsService.create(perms);
            }
        })
    }

}