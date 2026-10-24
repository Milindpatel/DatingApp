import { Photo } from './photo';

export interface User {
  id: number;
  username: string;
  knownAs: string;
  age: number;
  gender: string;
  created: string;
  lastActive: string;
  photoUrl: string | null;
  city: string;
  country: string;
  interests?: string;
  introduction?: string;
  lookingFor?: string;
  photos?: Photo[];
}

export interface RegisterRequest {
  username: string;
  password: string;
  gender: string;
  knownAs: string;
  dateOfBirth: string;
  city: string;
  country: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
