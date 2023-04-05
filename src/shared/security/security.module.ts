import { Module } from "@nestjs/common"
import { CustomJwtTokenService } from "./custom-jwt-token.service";
import { EncryptionSecurityService } from "./encryption-security.service";

@Module({
    imports:[],
    providers:[EncryptionSecurityService,CustomJwtTokenService],
    exports:[EncryptionSecurityService,CustomJwtTokenService]
})
export class SecurityModule{}