/* eslint-disable prettier/prettier */
import { Module,Global } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CommandModule } from "nestjs-command";
import { SharedModule } from "src/shared/shared.module";
import { UserModule } from "src/user/user.module";
import { PermissionController, RoleController } from "./controllers";
import { Permission, PermissionSchema, Role, RoleSchema } from "./models";
import { UpdatePermsScript } from "./scripts";
import { PermissionsService, RolesService } from "./services";
import { AuthGuard } from "./guards/auth.guard";

@Global()
@Module({
    controllers:[
        PermissionController,
        RoleController
    ],
    imports:[
        MongooseModule.forFeature([
            {name:Permission.name,schema:PermissionSchema},
            {name:Role.name,schema:RoleSchema}
        ]),
        SharedModule,
        UserModule,
        CommandModule,
    ],
    providers:[        
        PermissionsService,
        RolesService,
        // PermsGuard,
        UpdatePermsScript,
        AuthGuard
    ],
    exports:[
        PermissionsService,
        RolesService,
        UpdatePermsScript,
        CommandModule
    ],
})
export class AuthorizationModule{}