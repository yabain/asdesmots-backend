import { PermsType } from "src/authorization/types";

export const GameCompetitionPerms: PermsType = {
    READ_ALL : {
        name:"gamecompetition.read.all",
        description:"List of game competition",
        module: "GAME_COMPETITION"
    },
    CREATE : {
        name: "gamecompetition.create",
        description:"Create a new game competition",
        module: "GAME_COMPETITION"
    }
}