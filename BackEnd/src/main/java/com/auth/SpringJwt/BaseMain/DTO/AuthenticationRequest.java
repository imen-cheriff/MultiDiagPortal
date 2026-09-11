package com.auth.SpringJwt.BaseMain.DTO;

public class AuthenticationRequest {
    private String username;
    private String password;

    // Default constructor
    public AuthenticationRequest() {
    }

    // Constructor with fields
    public AuthenticationRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getters and setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    // Optional: toString method (exclude password for security)
    @Override
    public String toString() {
        return "AuthenticationRequest{" +
                "username='" + username + '\'' +
                ", password='[PROTECTED]'" +
                '}';
    }
}