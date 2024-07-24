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

export interface ChargePointDetails {
    id: string;
    id_list_auth: number;
    vendor: string;
    serial_number: string;
    box_serial_number: string;
    firmware_version: string;
    icc_id: string;
    imsi: string;
    meter_serial_number: string;
    meter_type: string;
    connectors: number;
    connection_type: string;
    location: string;
    coordinates: string;
}

export interface TableStatusDetails{
    action: string;
    status: string;
    timestamp: string;
}

export interface ArrayTableStatusDetails{
    data: TableStatusDetails[];
}