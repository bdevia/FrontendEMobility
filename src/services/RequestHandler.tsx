
class RequestHandler{
    //private static instance: RequestHandler;
    private static host: string = 'localhost';
    private static port: string = '8080';

    /*private constructor(){
        RequestHandler.host = 'localhost';
        RequestHandler.port = '8080';
    }

    public static getInstance(): RequestHandler {
        if(RequestHandler.instance == null){
            RequestHandler.instance = new RequestHandler();
        }
        return RequestHandler.instance;
    }*/

    public static async sendRequet(method: string, endPoint: string, authToken: string | null, body: any): Promise<any>{
        const url = `http://${RequestHandler.host}:${RequestHandler.port}${endPoint}`;
        console.log(url);
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify(body),
            });

            return await response.json();
        }
        catch(error){
            console.error(error);
            throw error;
        }
    }
}

export default RequestHandler;