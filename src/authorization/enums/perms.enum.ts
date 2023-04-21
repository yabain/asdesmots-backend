import { GameArcardePerms } from "src/game/enum";
import { GameLevelPerms, WordGameLevelPerms } from "src/gamelevel/enums";
import { UserPerms } from "src/user/enums";
import { PermsModuleType, PermsType } from "../types";


export const PermsModuleList : PermsModuleType =  {
    USER_PERMS : UserPerms,

};


export const PermsList = [UserPerms, GameLevelPerms, WordGameLevelPerms, GameArcardePerms]

export function getPermsAsArray()
{
    return PermsList.map((perms)=>Object.values(perms)).reduce((previous,curr)=>[...previous,...curr],[])
}