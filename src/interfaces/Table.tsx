export interface InputData{
    id: string;
    vendor: string;
    connection_type: string;
    status: string;
    timestamp: string;
}

export interface ArrayInputData{
    data: InputData[];
}

export interface ConnectorData{
    id: number;
    number_connector: number;
    status: string;
    errorCode: string;
    timestamp: string;
    sizeReservationQueue: number;
    idTagReservationInProgress: string;
}

export interface ArrayConnectorData{
    data: ConnectorData[];
}