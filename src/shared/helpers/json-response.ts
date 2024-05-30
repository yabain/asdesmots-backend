export class JsonResponse {

    success(message: any = 'Succès.', data: any = null) {
        return { 
            message : message,
            data : data
        }
    }  
    
    error(message: string, data: any = []) {
        return { 
            message : message,
            errors : data
        }
    }
}