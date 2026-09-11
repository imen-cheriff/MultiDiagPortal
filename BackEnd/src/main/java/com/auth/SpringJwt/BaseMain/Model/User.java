package com.auth.SpringJwt.BaseMain.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @JsonProperty("firstname")
    @Column(name = "firstname")
    private String firstName;

    @JsonProperty("lastname")
    @Column(name = "lastname")
    private String lastName;


    @Column(name = "username",nullable = false, unique = true)
    private String username;

    @Column(name = "password")
    private String password;

    private String role;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Token> tokens;

    @Column(name = "email")
    private String email;

    @Column(name = "email_verified")
    private boolean emailVerified = false;

    @Column(name = "temporary_password")
    private String temporaryPassword;

    @Column(name = "profile_image")
    private String profileImageUrl;

    private String fullName; // This will be saved in the database

    public String getFullName() {
        return firstName + " " + lastName;
    }


    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    @PrePersist
    public void prePersist() {
        this.fullName = getFullName();
    }

    @PreUpdate
    public void preUpdate() {
        this.fullName = getFullName();
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @JsonProperty("authorities")
    public String getAuthorityString() {
        return this.role;
    }

    @JsonProperty("authorities")
    public void setAuthorityString(String role) {
        this.role = role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = String.valueOf(role);
    }

    public List<Token> getTokens() {
        return tokens;
    }

    public void setTokens(List<Token> tokens) {
        this.tokens = tokens;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getTemporaryPassword() {
        return temporaryPassword;
    }

    public void setTemporaryPassword(String temporaryPassword) {
        this.temporaryPassword = temporaryPassword;
    }

    public String getProfileImageUrl() {return profileImageUrl;}

    public void setProfileImageUrl(String profileImageUrl) {this.profileImageUrl = profileImageUrl;}
}
