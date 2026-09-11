package com.auth.SpringJwt.BaseMain.Repository;

import com.auth.SpringJwt.BaseMain.Model.Token;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token, Integer> {

    @Bean
    @Query(value = """
    select t from Token t inner join User u on t.user.id = u.id
    where t.user.id = :userId and (t.expired = false or t.revoked = false)
    """)
    List<Token> findAllAccessTokensByUser(Integer userId);

    Optional<Token> findByAccessToken(String token);

    Optional<Token > findByRefreshToken(String token);
}
