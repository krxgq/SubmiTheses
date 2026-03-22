// Authentication types

// API Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface SetupPasswordRequest {
  token: string;
  password: string;
}

export interface ResendInvitationRequest {
  id: string;
}

// API Response types
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}
