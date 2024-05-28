export interface MapState{
    status: string,
    timestamp: string,
}

export interface MapStateConnector{
    status: string,
    errorCode: string,
    sizeReservationQueue: number,
    timestamp: string,
}