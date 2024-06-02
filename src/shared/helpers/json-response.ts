export class JsonResponse {

    success(message: any, data: any = null) {
        return { 
            message : message,
            data : data
        }
    }  
    
    error(message: string, data: any = null) {
        return { 
            message : message,
            errors : data
        }
    }
}