package com.auth.SpringJwt.BaseMain.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "token")
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "access_token")
    private String accessToken;

    @Column(name = "refresh_token")
    private String refreshToken;

    @Column(name = "is_revoked")
    public boolean revoked;

    @Column(name = "is_expired")
    public boolean expired;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;


    public boolean isExpired(boolean b) {
        return expired;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public void setRevoked(boolean revoked) {
        this.revoked = revoked;
    }

    public void setExpired(boolean expired) {
        this.expired = expired;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
