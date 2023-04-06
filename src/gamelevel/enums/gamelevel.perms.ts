import { PermsType } from "src/authorization/types";

export const GameLevelPerms: PermsType = {
    READ_ALL : {
        name:"gamelevel.read.all",
        description:"List of game levels",
        module: "GAMELEVEL"
    },
    CREATE : {
        name: "gamelevel.create",
        description:"Create a new game level",
        module: "GAMELEVEL"
    }
}