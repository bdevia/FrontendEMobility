
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

    public static async sendRequet(method: string, endPoint: string, authToken: string | null, body: any): Promise<{data: any, status: number}>{
        const url = `http://${RequestHandler.host}:${RequestHandler.port}/api${endPoint}`;
        console.log(url);
        try {
            let response;
            if(method === 'GET'){
                response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json', 
                    }
                });
            }
            else{
                response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json', 
                    },
                    body: JSON.stringify(body),
                });
            }

            const responseData = await response.json();
            return {data: responseData, status: response.status}
        }
        catch(error){
            console.error(error);
            throw error;
        }
    }
}

export default RequestHandler;