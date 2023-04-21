import { Body, Controller, Get, HttpStatus, Post } from "@nestjs/common";
import { SecureRouteWithPerms } from "src/shared/security";
import { CreateGameArcardeDTO } from "../dtos";
import { GameArcardePerms } from "../enum";
import { GameArcardeService } from "../services";

@Controller("game-arcarde")
export class GameArcardeController
{
    constructor(private gameArcardeService:GameArcardeService){}

    /**
     * 
     * @api {post} /game-arcarde create new game arcarde
     * @apiDescription create new game arcard
     * @apiName Create game arcarde
     * @apiGroup Game Arcarde
     * @apiUse apiSecurity
     * @apiUse apiDefaultResponse
     * @apiUse CreateGameArcardeDTO
     * 
     * @apiSuccess (201 Created) {Number} statusCode status code
     * @apiSuccess (201 Created) {String} Response Description
     * @apiSuccess (201 Created) {Object} data response data
     * @apiSuccess (201 Created) {String} data.name Role name
     * @apiSuccess (201 Created) {String} data.description Role description
     * 
     * @apiError (Error 4xx) 401-Unauthorized Token not supplied/invalid token 
     * @apiUse apiError
     * 
     */
    @Post()
    @SecureRouteWithPerms(
        GameArcardePerms.CREATE
    )
    async create(@Body() createGameArcardeDTO:CreateGameArcardeDTO)
    {
        return {
            statusCode:HttpStatus.CREATED,
            message:"Game arcarde Created",
            data:await this.gameArcardeService.create(createGameArcardeDTO)
        }
    }
}