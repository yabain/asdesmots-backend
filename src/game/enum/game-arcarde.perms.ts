import { PermsType } from "src/authorization/types";

export const GameArcardePerms: PermsType = {
    READ_ALL : {
        name:"gamearcarde.read.all",
        description:"List of game arcard",
        module: "GAME_ARCARDE"
    },
    READ_OWNER : {
        name:"gamearcarde.read.owner",
        description:"Get game arcard",
        module: "GAME_ARCARDE"
    },
    CREATE : {
        name: "gamearcarde.create",
        description:"Create a new game arcarde",
        module: "GAME_ARCARDE"
    }
}