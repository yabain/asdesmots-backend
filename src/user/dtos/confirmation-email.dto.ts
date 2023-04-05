import { IsNotEmpty, IsString, Matches } from "class-validator";

export class ConfirmationEmailDTO
{
    /**
     * @apiDefine ConfirmEmailDTO
     * @apiBody {String} email User email
     */
    @IsNotEmpty()
    @IsString()
    @Matches("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])")
    email:string;
}