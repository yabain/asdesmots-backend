import { PermsType } from "src/authorization/types";

export const UserPerms: PermsType = {
    READ_ALL : {
        name:"user.read.all",
        description:"Liste des utilisateurs de l'application",
        module: "USER"
    },
    READ_UNIQUE : {
        name: "user.read.owner",
        description:"Obtenir les informations d'un utilsateur",
        module: "USER"
    }
}