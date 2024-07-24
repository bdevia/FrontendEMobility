export interface ModalInterface{
    show: boolean,
    title: string,
    cause: string,
    variant: string
}

export interface ModalInput{
    modalData: ModalInterface,
    onHide: () => void;
}

export interface ModalUpdateInput{
    show: boolean,
    onHide: () => void,
    acept: (retries: string, retieveDate: string) => void
}