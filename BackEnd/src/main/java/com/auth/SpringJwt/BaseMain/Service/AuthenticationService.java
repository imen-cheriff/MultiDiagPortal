package com.auth.SpringJwt.BaseMain.Service;


import com.auth.SpringJwt.BaseMain.Exception.UnauthorizedException;
import com.auth.SpringJwt.BaseMain.DTO.AuthenticationRequest;
import com.auth.SpringJwt.BaseMain.DTO.AuthenticationResponse;
import com.auth.SpringJwt.BaseMain.Model.Token;
import com.auth.SpringJwt.BaseMain.Model.User;
import com.auth.SpringJwt.BaseMain.Repository.TokenRepository;
import com.auth.SpringJwt.BaseMain.Repository.UserRepository;
import com.auth.SpringJwt.BaseMain.Repository.VerificationTokenRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final VerificationService verificationService;

    private final TokenRepository tokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;

    private final AuthenticationManager authenticationManager;


    public Page<User> allUsers(int page, int size) {
        return repository.findAll(PageRequest.of(page, size));
    }


    public AuthenticationService(UserRepository repository,
                                 PasswordEncoder passwordEncoder,
                                 JwtService jwtService, EmailService emailService, VerificationService verificationService,VerificationTokenRepository verificationTokenRepository,
                                 TokenRepository tokenRepository,
                                 AuthenticationManager authenticationManager) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.verificationService = verificationService;
        this.tokenRepository = tokenRepository;
        this.authenticationManager = authenticationManager;
        this.verificationTokenRepository = verificationTokenRepository;
    }

    public boolean isUsernameAvailable(String username) {
        return !repository.findByUsername(username).isPresent();
    }

    public boolean isEmailAvailable(String email){
        return !repository.findByEmail(email).isPresent();
    }



    public AuthenticationResponse register(User request){
        AuthenticationResponse resp = new AuthenticationResponse();

            User user = new User();

        if (repository.findByUsername(request.getUsername()).isPresent()) {
             resp.setMessage("username déjà utilisé.");

        }else {
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEmail(request.getEmail());
            user.setRole(request.getRole());
            user.setUsername(request.getUsername());
            user.setFullName(request.getFullName());
            user.setEmailVerified(false);
//            user.setPassword(passwordEncoder.encode(request.getPassword()));
            User userResult = repository.save(user);

        System.out.println("Firstname: " + request.getFirstName());
        System.out.println("Lastname: " + request.getLastName());

        if (userResult.getId() > 0) {
                resp.setUser((userResult));
                resp.setMessage("User Saved Successfully");
                resp.setStatusCode(200);
            }
            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(new HashMap<>(), user);
            resp.setAccessToken(accessToken);
            resp.setRefreshToken(refreshToken);

            saveUserToken(accessToken, refreshToken, user);

            // Generate verification token and send email
            verificationService.createVerificationTokenForUser(userResult);
        }
            return resp;
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) throws UnauthorizedException {
        // First, find the user to check verification status
        User user = repository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Check if email is verified
        if (!user.isEmailVerified()) {
            throw new UnauthorizedException("Email not verified");
        }

        // Try to authenticate
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            // If normal authentication fails, check if they're using temporary password
            if (user.getTemporaryPassword() != null &&
                    passwordEncoder.matches(request.getPassword(), user.getTemporaryPassword())) {
                // Authentication with temporary password succeeded
            } else {
                // Neither regular password nor temporary password worked
                throw new BadCredentialsException("Invalid credentials");
            }
        }

        // Check if user is using temporary password
        boolean isUsingTempPassword = user.getTemporaryPassword() != null &&
                passwordEncoder.matches(request.getPassword(), user.getTemporaryPassword());

        // Generate tokens
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(new HashMap<>(), user);

        // Create response
        AuthenticationResponse response = new AuthenticationResponse();
        response.setStatusCode(200);
        response.setAccessToken(accessToken);
        response.setFullname(user.getFullName());
        response.setFirstname(user.getFirstName());
        response.setRole(user.getRole());
        response.setRefreshToken(refreshToken);
        response.setExpirationTime("24Hrs");
        response.setMessage("Successfully Logged In");
        response.setPasswordChangeRequired(isUsingTempPassword);

        return response;
    }



    private void revokeAllTokenByUser(User user) {
        List<Token> validTokens = tokenRepository.findAllAccessTokensByUser(user.getId());
        if(validTokens.isEmpty()) {
            return;
        }

        validTokens.forEach(t-> {
            t.setExpired(true);
            t.setRevoked(true);
        });

        tokenRepository.saveAll(validTokens);
        System.out.println(validTokens);
    }
    private void saveUserToken(String accessToken, String refreshToken, User user) {
        Token token = new Token();
        token.setAccessToken(accessToken);
        token.setRefreshToken(refreshToken);
        token.setExpired(false);
        token.setRevoked(false);
        token.setUser(user);
        tokenRepository.save(token);
    }

    public ResponseEntity refreshToken( HttpServletRequest request, HttpServletResponse response) {
        // extract the token from authorization header
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if(authHeader == null || !authHeader.startsWith("Bearer ")) {
            return new ResponseEntity(HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);

        // extract username from token
        String username = jwtService.extractUsername(token);

        // check if the user exist in database
        User user = repository.findByUsername(username)
                .orElseThrow(()->new RuntimeException("NO USER FOUND"));


        AuthenticationResponse resp = new AuthenticationResponse();
        // check if the token is valid
        if(jwtService.isValidRefreshToken(token, user)) {
            tokenRepository.deleteById(user.getId());
            System.out.println(user.getId());
            // generate access token
            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(new HashMap<>(), user);
            resp.setStatusCode(200);
            resp.setAccessToken(accessToken);
            resp.setRole(user.getRole());
            resp.setRefreshToken(refreshToken);
            resp.setExpirationTime("24Hrs");
            resp.setMessage("Successfully Refreshed");


            revokeAllTokenByUser(user);
            saveUserToken(accessToken, refreshToken, user);

            return new ResponseEntity(resp, HttpStatus.OK);
        }

        return new ResponseEntity(HttpStatus.UNAUTHORIZED);

    }

    public AuthenticationResponse getAllUsers() {
        AuthenticationResponse res = new AuthenticationResponse();

        try {
            List<User> result = repository.findAll();
            if (!result.isEmpty()) {
                res.setUsersList(result);
                res.setStatusCode(200);
                res.setMessage("Successful");
            } else {
                res.setStatusCode(404);
                res.setMessage("No users found");
            }
            return res;
        } catch (Exception e) {
            res.setStatusCode(500);
            res.setMessage("Error occurred: " + e.getMessage());
            return res;
        }
    }

    public AuthenticationResponse getMyInfo(String username) {
        AuthenticationResponse resp = new AuthenticationResponse();
        try {
            Optional<User> userOptional = repository.findByUsername(username);

            System.out.println("Searching for user: " + username);


            if (userOptional.isPresent()) {
                resp.setUser(userOptional.get());
                resp.setStatusCode(200);
                resp.setMessage("User found successfully");
            } else {
                resp.setStatusCode(404);
                resp.setMessage("User not found");
            }

        } catch (Exception e) {
            resp.setStatusCode(500);
            resp.setMessage("Error occurred while getting user info: " + e.getMessage());
        }
        return resp;
    }


    public AuthenticationResponse getUsersById(Integer id) {
        AuthenticationResponse resp = new AuthenticationResponse();
        try {
            User usersById = repository.findById(id).orElseThrow(() -> new RuntimeException("User Not found"));
            resp.setUser(usersById);
            resp.setStatusCode(200);
            resp.setMessage("Users with id '" + id + "' found successfully");
        } catch (Exception e) {
            resp.setStatusCode(500);
            resp.setMessage("Error occurred: " + e.getMessage());
        }
        return resp;
    }

    @Transactional
    public AuthenticationResponse deleteUser(Integer userId) {
        AuthenticationResponse resp = new AuthenticationResponse();
        try {
            Optional<User> userOptional = repository.findById(userId);
            if (userOptional.isPresent()) {
                verificationTokenRepository.deleteByUser(userOptional);
                repository.deleteById(userId);
                resp.setStatusCode(200);
                resp.setMessage("User deleted successfully");

            } else {
                resp.setStatusCode(404);
                resp.setMessage("User not found for deletion");
            }
        } catch (Exception e) {
            resp.setStatusCode(500);
            resp.setMessage("Error occurred while deleting user: " + e.getMessage());
        }
        return resp;
    }

    public AuthenticationResponse updateUser(Integer userId, User updatedUser) {
        AuthenticationResponse resp = new AuthenticationResponse();
        try {
            Optional<User> userOptional = repository.findById(userId);
            if (userOptional.isPresent()) {
                User existingUser = userOptional.get();
                existingUser.setFirstName(updatedUser.getFirstName());
                existingUser.setLastName(updatedUser.getLastName());
                existingUser.setUsername(updatedUser.getUsername());
                existingUser.setEmail(updatedUser.getEmail());
                existingUser.setFullName(updatedUser.getFullName());


                User savedUser = repository.save(existingUser);
                resp.setUser(savedUser);
                resp.setStatusCode(200);
                resp.setMessage("User updated successfully");
            } else {
                resp.setStatusCode(404);
                resp.setMessage("User not found for update");
            }
        } catch (Exception e) {
            resp.setStatusCode(500);
            resp.setMessage("Error occurred while updating user: " + e.getMessage());
        }
        return resp;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof User) {
            User user = (User) authentication.getPrincipal();
            user = repository.findById(user.getId().intValue()).orElse(null);

            Hibernate.initialize(user.getTokens());
            return user;
        }
        return null;
    }


    public void saveProfileImage(MultipartFile file, String token) throws IOException {
        String uploadDir = "uploads/profiles/";
        Path filePath = Paths.get(uploadDir + file.getOriginalFilename());
        Files.createDirectories(filePath.getParent());
        Files.write(filePath, file.getBytes());
    }

    public void updateUserProfileImage(Integer userId, MultipartFile file) throws IOException {
        String uploadDir = "uploads/profiles/";
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir + fileName);
        Files.createDirectories(filePath.getParent());
        Files.write(filePath, file.getBytes());

        // Update user in database
        User user = repository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setProfileImageUrl(uploadDir + fileName);
        repository.save(user);
    }


}