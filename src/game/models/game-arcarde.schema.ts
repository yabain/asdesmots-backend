import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { Document, HydratedDocument } from "mongoose";
import { CompetitionGame } from "./competition-game.schema";
import { PlayerGameRegistration } from "./player-game-registration.schema";
import { User } from "src/user/models";

export type GameArcardeDocument = HydratedDocument<GameArcarde>

@Schema({
    toObject:{
        transform(doc, ret, options) {
            if(ret.owner) ret.owner=ret.owner._id;
            delete ret.__v
            delete ret.isDeleted

        },
    },
    toJSON:{
        transform(doc, ret, options) {
            if(ret.owner) ret.owner=ret.owner._id;
            delete ret.__v
            delete ret.isDeleted
        },
    }
})
export class GameArcarde extends Document
{
    
    @Prop({default:"", unique:true})
    name:string;

    @Prop({default:""})
    description:string;

    @Prop({default:true})
    isOnlineGame:Boolean;

    @Prop({type:mongoose.Types.ObjectId,ref:User.name,default:null})
    owner:User;

    @Prop({default:false})
    canRegisterPlayer:Boolean;

    @Prop({default:true})
    isFreeRegistrationPlayer:Boolean;

    @Prop({default:100})
    maxPlayersNumber:number;

    @Prop({type:Date,default:Date.now()})
    startDate:Date;

    @Prop({type:Date,default:Date.now()})
    endDate:Date;
    
    @Prop({type:Date,default:Date.now()})
    startRegistrationDate:Date;

    @Prop({type:Date,default:Date.now()})
    endRegistrationDate:Date;

    @Prop({type:[mongoose.Types.ObjectId],ref:PlayerGameRegistration.name,default:[]})
    playerGameRegistrations:PlayerGameRegistration[];

    @Prop({type:[mongoose.Types.ObjectId],ref:CompetitionGame.name,default:[]})
    competitionGames:CompetitionGame[];

    @Prop({default:Date.now(),required:true})
    createdAt:Date
}

export const GameArcardeSchema = SchemaFactory.createForClass(GameArcarde)
