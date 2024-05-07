export interface InputData{
    id: string;
    vendor: string;
    connection_type: string;
    connectors: number;
}

export interface ArrayInputData{
    data: InputData[];
}