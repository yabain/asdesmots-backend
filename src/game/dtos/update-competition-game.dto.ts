import { PartialType } from "@nestjs/mapped-types";
import { CreateCompetitionGameDTO } from "./create-competition-game.dto";

/**
 * @apiDefine UpdateGameCompetitionGameDTO Update game competition
 * @apiBody {String {4..65}} [name] Game competition name
 * @apiBody {String {4..65}} [description] Game competition description
 * @apiBody {Number} [level] level of games
 * @apiBody {Boolean} [isSinglePart] It's set to true if it's a one-party competition
 * @apiBody {Boolean} [canRegisterPlayer] is set to true if players can register for the competition
 * @apiBody {String} [localisation]  competition location area
 * @apiBody {Number} [maxPlayerLife]  Maximum number of lives of a player in the competition
 * @apiBody {Number} [maxTimeToPlay]  Number of times defined in seconds to rent to a player to enter a word.
 * @apiBody {Date} [startDate] game start date
 * @apiBody {Date} [endDate] game end date
 * @apiBody {Number} [maxOfWinners]  Maximum number of winners per competition
 * @apiBody {String} [lang] Language of the competition. it can be "en" for English and "fr" for French
 * @apiBody {String} [parentCompetition] In case it is a sub competition, this value represents the parent competition
 * @apiBody {String[]} [gameWinnerCriterias] competition winning criteria ID table
 * @apiBody {String[]} [gameJudgesID] competition judge ID 
 * @apiBody {CreateGamePartDTO[]} [gameJudges] competition judges ID table
 */

export class UpdateGameCompetitionGameDTO  extends PartialType(CreateCompetitionGameDTO)
{}