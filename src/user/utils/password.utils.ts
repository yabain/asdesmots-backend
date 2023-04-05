const bcrypt=require("bcryptjs")

export class PasswordUtil
{
    static hash(password:string):string
    {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    }

    static compare(savedPassword:string,newPassword:string):boolean
    {
        return bcrypt.compareSync(newPassword,savedPassword)
    }
}