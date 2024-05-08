export interface InputData{
    id: string;
    vendor: string;
    connection_type: string;
    connectors: number;
    status: string;
}

export interface ArrayInputData{
    data: InputData[];
}