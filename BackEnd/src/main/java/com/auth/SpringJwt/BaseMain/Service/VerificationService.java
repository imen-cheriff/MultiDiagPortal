package com.auth.SpringJwt.BaseMain.Service;

import com.auth.SpringJwt.BaseMain.Model.User;
import com.auth.SpringJwt.BaseMain.Model.VerificationToken;
import com.auth.SpringJwt.BaseMain.Repository.UserRepository;
import com.auth.SpringJwt.BaseMain.Repository.VerificationTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

import static com.auth.SpringJwt.BaseMain.Util.PasswordGenerator.generateRandomPassword;

@Service
public class VerificationService {
    @Autowired
    private VerificationTokenRepository tokenRepository;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void createVerificationTokenForUser(User user) {
        String token = UUID.randomUUID().toString();
        String tempPassword = generateRandomPassword();

        // Save temporary password to user
        user.setTemporaryPassword(passwordEncoder.encode(tempPassword));
        userRepository.save(user);

        // Create verification token
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setUser(user);
        verificationToken.setToken(token);
        verificationToken.setExpiryDate(LocalDateTime.now().plusDays(1));

        tokenRepository.save(verificationToken);

        // Send email
        emailService.sendVerificationEmail(user, token, tempPassword);
    }

    public String validateVerificationToken(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token);

        if (verificationToken == null) {
            return "invalid";
        }

        if (LocalDateTime.now().isAfter(verificationToken.getExpiryDate())) {
            return "expired";
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        return "valid";
    }

    public void resendVerificationToken(String email) {
        // 1. Get user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // 2. Delete existing token(s) for this user (optional but cleaner)
        tokenRepository.deleteByUser(user);

        // 3. Generate a new token
        String token = UUID.randomUUID().toString();

        // 4. Create and save new token
        VerificationToken newToken = new VerificationToken();
        newToken.setToken(token);
        newToken.setUser(user);
        newToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        tokenRepository.save(newToken);

        // 5. (Optional) Temporary password logic if required
        String tempPassword = generateRandomPassword();

        // 6. Send verification email
        emailService.sendVerificationEmail(user, token, tempPassword);
    }

}
