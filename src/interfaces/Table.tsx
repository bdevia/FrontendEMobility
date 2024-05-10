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

export interface ConnectorData{
    id: number;
    number_connector: number;
    status: string;
    sizeReservationQueue: number;
    idTagReservationInProgress: string;
}

export interface ArrayConnectorData{
    data: ConnectorData[];
}