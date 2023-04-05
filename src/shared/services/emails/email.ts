

export class Email
{
    private sender:string="";
    private receiver:string[]=[];
    private otherReceiver:string[]=[];
    private _file:string="";
    private _content:string="";
    private _subject:string="";
    private _template:string=null;
    private _templateVar:Record<string,any>={}

    from(userFrom:string):Email
    {
        this.sender=userFrom;
        return this;
    }

    to(userTo:string):Email
    {
        this.receiver.push(userTo);
        return this;
    }

    cc(ccUser:string):Email
    {
        this.otherReceiver.push(ccUser);
        return this;
    }

    subject(titleMail:string):Email
    {
        this._subject=titleMail;
        return this;
    }

    content(cont:string):Email
    {
        this._content=cont;
        return this;
    }

    

    file(file:any):Email
    {
        this._file=file;
        return this;
    }

    template(temp:string):Email
    {
        this._template=temp;
        return this;
    }

    templateVar(tmpVar:Record<string,any>):Email
    {
        this._templateVar=tmpVar;
        return this;
    }
    
    getTemplate()
    {
        return this._template
    }
    toJSON()
    {
        return this.toString();
    }

    private toString()
    {
        return {
            from:this.sender,
            to:this.receiver,
            subject:this._subject,
            content:this._content,
            file:this._file.toString(),
            cc:this.otherReceiver,
            template:this._template,
            templateVar:this._templateVar
        }
    }
    
}