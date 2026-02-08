export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

export interface User {
    id: number;
    username: string;
    email: string;
    fullName: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    enabled: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    tokenType?: string;
    message?: string;
}