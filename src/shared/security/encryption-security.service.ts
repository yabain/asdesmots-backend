import crypto from "crypto"
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EncryptionSecurityService
{
    private secretKey:string="";
    private algoritm=''

    constructor(private readonly configService:ConfigService)
    {
        this.secretKey=this.configService.get<string>("SECRET_ENCRIPTION_KEY");
        this.algoritm=this.configService.get<string>("SECRET_ENCRIPTION_ALGORITHM");

    }
    private generateRandomKey()
    {
        let str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$%&/()=?^"!|[]{}*+-:.;,_@#<>';
        return str.split('').sort((a, b) => {return Math.random() - 0.5}).join('');
    }

    cipher(str:string):string
    {
        let sha256=crypto.createHash('sha256');
        sha256.update(this.secretKey)

        let initVector=crypto.randomBytes(16)
        let cipher= crypto.createCipheriv(this.algoritm, sha256.digest(),initVector);
        let cipherText = cipher.update(Buffer.from(str));
        let encrypted = Buffer.concat([initVector,cipherText,cipher.final()]).toString('base64')
        return encrypted;
    }

    decipher(encrypted):string
    {
        let sha256 = crypto.createHash('sha256');
        sha256.update(this.secretKey);
        let input = Buffer.from(encrypted, "base64");
        let initVector=input.slice(0,16);
        let decipher = crypto.createDecipheriv(this.algoritm,sha256.digest(),initVector);
        let cipherText = input.slice(16);
        // let plainText = decipher.update(cipherText) + decipher.final();
        let plainText = Buffer.concat([decipher.update(cipherText) , decipher.final()]);
        return plainText.toString();

    }

}