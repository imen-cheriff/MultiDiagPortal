package com.auth.SpringJwt.BaseMain.DTO;


import com.auth.SpringJwt.BaseMain.Model.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class AuthenticationResponse {

        private int statusCode;
        private String error;
        private String message;
        private String accessToken;
        private String refreshToken;
        private String expirationTime;
        private String name;
        private String firstname;
        private String lastname;
        private String role;
        private String email;
        private String fullname;
        private String password;
        private User user;
        private List<User> UsersList;
        private boolean passwordChangeRequired;



    public void setUser(User user) {
        this.user = user;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }

    public void setError(String error) {
        this.error = error;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public void setExpirationTime(String expirationTime) {
        this.expirationTime = expirationTime;
    }


    public String getFirstname() {
        return firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setUsersList(List<User> usersList) {
        UsersList = usersList;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public String getError() {
        return error;
    }

    public String getMessage() {
        return message;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public String getExpirationTime() {
        return expirationTime;
    }


    public String getRole() {
        return role;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public User getUser() {
        return user;
    }

    public List<User> getUsersList() {
        return UsersList;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public boolean isPasswordChangeRequired() {return passwordChangeRequired;}

    public void setPasswordChangeRequired(boolean passwordChangeRequired) {this.passwordChangeRequired = passwordChangeRequired;}
}