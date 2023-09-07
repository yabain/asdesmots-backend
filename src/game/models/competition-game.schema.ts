import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { Document, HydratedDocument } from "mongoose";
import { WordGameLevelLangType } from "src/gamelevel/enums";
import { User } from "src/user/models";
import { GamePart } from "./game-part.schema";
import { GameWinnerCriteria } from "./game-winner-criteria.schema";
import { GameWinner } from "./game-winner.schema";
import { PlayerGameRegistration } from "./player-game-registration.schema";
import { GameLevel } from "src/gamelevel/models";
import { GameState } from "../enum";

export type CompetitionGameDocument = HydratedDocument<CompetitionGame>

//Mettre en place un middle pour que l'ors de la sauvegarde et l'ors de la creation l'attribut isSinglePart ce mette a jours automatiquement 
//en fonction du nombre de partie contenu dans l'attribue gamePart

@Schema({
    toObject:{
        transform(doc, ret, options) {
            delete ret.__v
            delete ret.isDeleted

        },
    },
    toJSON:{
        transform(doc, ret, options) {
            delete ret.__v
            delete ret.isDeleted
        },
    }
})
export class CompetitionGame extends Document
{

    @Prop({default:"", unique:true})
    name:string;

    @Prop({default:""})
    description:string;

    @Prop({type:mongoose.Types.ObjectId,ref:GameLevel.name,default:null})
    gameLevel:GameLevel;

    @Prop({default:true})
    isSinglePart:Boolean;

    @Prop({default:true})
    canRegisterPlayer:Boolean;

    @Prop({default:""})
    localisation:String

    @Prop({default:0})
    maxPlayerLife:Number;

    @Prop({default:0})
    maxTimeToPlay:Number;

    @Prop({type:Date,default:Date.now()})
    startDate:Date;

    @Prop({type:Date,default:Date.now()})
    endDate:Date;

    @Prop({default:false})
    isStarted:Boolean;

    @Prop({default:2})
    minOfPlayers:Number;

    @Prop({default:1})
    maxOfWinners:Number;

    @Prop({type:[{type:mongoose.Types.ObjectId,ref:GameWinnerCriteria.name}],default:[]})
    gameWinnerCriterias:GameWinnerCriteria[];

    @Prop({type:mongoose.Types.ObjectId,ref:User.name,default:null})
    gameJudge:User;

    @Prop({type:[{type:mongoose.Types.ObjectId,ref:GamePart.name}],default:[]})
    gameParts:GamePart[];

    @Prop({type:[{type:mongoose.Types.ObjectId,ref:GameWinner.name}],default:[]})
    gameWinners:GameWinner[];

    @Prop({type:[{type:mongoose.Types.ObjectId,ref:PlayerGameRegistration.name}],default:[]})
    playerGameRegistrations:PlayerGameRegistration[];

    @Prop({type:mongoose.Types.ObjectId,ref:CompetitionGame.name,default:null})
    parentCompetition:CompetitionGame;

    @Prop({enum:GameState,default:GameState.NO_START})
    gameState:GameState;

    @Prop({enum:WordGameLevelLangType,default:WordGameLevelLangType.FR})
    lang:WordGameLevelLangType;

    @Prop({default:Date.now(),required:true})
    createdAt:Date
}

export const CompetitionGameSchema = SchemaFactory.createForClass(CompetitionGame)
