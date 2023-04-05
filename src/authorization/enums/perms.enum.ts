import { SubscriptionPerms } from "src/subscription/enums";
import { UserPerms } from "src/user/enums";
import { PermsModuleType, PermsType } from "../types";


export const PermsModuleList : PermsModuleType =  {
    USER_PERMS : UserPerms,
    SUBSCRIPTION_PERMS :  SubscriptionPerms
};


export const PermsList = [UserPerms, SubscriptionPerms]

export function getPermsAsArray()
{
    return PermsList.map((perms)=>Object.values(perms)).reduce((previous,curr)=>[...previous,...curr],[])
}