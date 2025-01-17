
export interface ApiResponseType{
    statusCode: number;
    data: any;
    message: string;
    success: boolean;
}

class ApiResponse implements ApiResponseType {

    statusCode: number;
    data: any;
    message: string;
    success: boolean;

    constructor(statusCode: number, data: any, message: string){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export default ApiResponse