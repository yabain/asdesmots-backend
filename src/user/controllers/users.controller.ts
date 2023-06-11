import { Controller, Get, HttpStatus } from "@nestjs/common"
import { SecureRouteWithPerms } from "src/shared/security";
import { UserPerms } from "../enums";
import { UsersService } from "../services";

@Controller("users")
export class UsersController
{
    constructor(private usersService:UsersService){}

    // @SecureRouteWithPerms(
    //     // UserPerms.READ_ALL
    //     )
    @Get()
    async getAll()
    {
        return {
            statusCode:HttpStatus.CREATED,
            message:"Get users list",
            data: await this.usersService.findAll()
        }
    }
}