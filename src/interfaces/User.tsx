export interface User{
    idTag: string | null;
    username: string | null;
    typeUser: string | null;
    token: string | null;
}

export interface UserState{
    status: string;
    turn: number;
}