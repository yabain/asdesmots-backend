import { PermsType } from "src/authorization/types";

export const WordGameLevelPerms: PermsType = {
    READ_ALL : {
        name:"wordgamelevel.read.all",
        description:"list of all the words of a game level",
        module: "GAMELEVEL"
    },
    CREATE : {
        name: "wordgamelevel.create",
        description:"Create a new word in a game level",
        module: "GAMELEVEL"
    }
}