import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

/**
 * @apiDefine CreateSubscriptionDTO Create subscription information
 * @apiBody {String} gameID Game ID
 * @apiBody {String} ownerID User ID
 * @apiBody {String} Period Subscription period
 */
export class CreateSubscriptionDTO
{
    @IsMongoId()
    gameID:String

    @IsMongoId()
    ownerID:String;

    @IsString()
    @IsNotEmpty()
    period:String;
}