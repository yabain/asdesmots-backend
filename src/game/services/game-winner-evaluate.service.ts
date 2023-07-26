import { Injectable } from "@nestjs/common";
import { User } from "src/user/models";
import { CompetitionGame } from "../models";

@Injectable()
export class GameWinnerEvaluateService
{


    evaluate()
    {

    }

    evaluateMaxPt(player:User,gameCompetition:CompetitionGame):boolean
    {
        return false;
    }
}