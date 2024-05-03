export interface InputData{
    id: string;
    vendor: string;
    connectionType: string;
    numberConnectors: number;
}

export interface ArrayInputData{
    data: InputData[];
}