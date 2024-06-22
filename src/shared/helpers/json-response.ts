export class JsonResponse {

    success(message: any, data: any = null) {
        return data ? { 
            message : message,
            data : data
        }
        : { 
            message : message,
        }
    }  
    
    error(message: string, errors: any = null) {
        return errors ? { 
            message : message,
            errors : errors
        }
        : { 
            message : message,
        }
    }
}