import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common/decorators";
import { PermsGuard } from "src/authorization/guards";
import { PermsValueType, PERMS_KEY } from "src/authorization/types";
import { UserJwtAuthGuard } from "src/user/guards";

export function SecureRouteWithPerms(...perms:PermsValueType[])
{
    return applyDecorators(
        SetMetadata(PERMS_KEY,perms),
        UseGuards(UserJwtAuthGuard,PermsGuard),
    )
}