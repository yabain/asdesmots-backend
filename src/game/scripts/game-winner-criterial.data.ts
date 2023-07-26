import { GameWinnerCriteriaType } from "../enum";

export const GameWinnerCriteriaData:{name:string,description?:string,gameWinnerCriterialType:GameWinnerCriteriaType}[] =
[
    {
        name:"Tous les mots sont corrects ",
        description: "Pour validé ce critéres tous les mots doivents être corrects",
        gameWinnerCriterialType:GameWinnerCriteriaType.WIN_ALL_WORD
    }
]