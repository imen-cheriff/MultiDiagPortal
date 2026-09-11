package com.auth.SpringJwt.BaseMain.Controller;

import com.auth.SpringJwt.BaseMain.Exception.UnauthorizedException;
import com.auth.SpringJwt.BaseMain.DTO.AuthenticationRequest;
import com.auth.SpringJwt.BaseMain.DTO.ChangePasswordRequest;
import com.auth.SpringJwt.BaseMain.DTO.ChangePasswordResponse;
import com.auth.SpringJwt.BaseMain.DTO.AuthenticationResponse;
import com.auth.SpringJwt.BaseMain.Model.User;
import com.auth.SpringJwt.BaseMain.Repository.UserRepository;
import com.auth.SpringJwt.BaseMain.Service.AuthenticationService;
import com.auth.SpringJwt.BaseMain.Service.UserDetailsServiceImp;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    private final AuthenticationService authService;
    private UserDetailsServiceImp userService;
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;



    public AuthenticationController(AuthenticationService authService, UserRepository repository, PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }


    @PostMapping("/admin/register")
    public ResponseEntity<?> register(@RequestBody User request) {
        // Check if the username is available
        if (!authService.isUsernameAvailable(request.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }

        try {
            // Register the user via authService
            AuthenticationResponse response = authService.register(request);
            return ResponseEntity.ok(response); // Return the successful registration response
        } catch (Exception e) {
            // Handle any unexpected errors during registration
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred while registering the user"));
        }
    }


    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(
            @RequestBody AuthenticationRequest request
    ) throws UnauthorizedException {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PostMapping("/refresh_token")
    public ResponseEntity refreshToken(HttpServletRequest request, HttpServletResponse response) {
        return ResponseEntity.ok(authService.refreshToken(request, response));
    }

    @PostMapping("/change-password/{id}")
    public ResponseEntity<?> changePassword(@PathVariable Integer id, @RequestBody @Valid ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body("New password and confirm password do not match.");
        }

        return repository.findById(id).map(user -> {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            repository.save(user);
            return ResponseEntity.ok().body(new ChangePasswordResponse("Password updated successfully."));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/admin/all-users")
    public ResponseEntity<AuthenticationResponse> getAllUsers(){
        return ResponseEntity.ok(authService.getAllUsers());

    }

    @GetMapping(value = "/profile")
    public ResponseEntity<AuthenticationResponse> profile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        final String username = userDetails.getUsername();
        return ResponseEntity.ok(this.authService.getMyInfo(username));
    }

    @GetMapping("/get-user/{userId}")
    public ResponseEntity<AuthenticationResponse> getUSerByID(@PathVariable Integer userId){
        return ResponseEntity.ok(authService.getUsersById(userId));

    }

    @PutMapping("/admin/update/{userId}")
    public ResponseEntity<AuthenticationResponse> updateUser(@PathVariable Integer userId, @RequestBody User resp){
        return ResponseEntity.ok(authService.updateUser(userId, resp));
    }


    @DeleteMapping("/admin/delete/{userId}")
    public ResponseEntity<AuthenticationResponse> deleteUSer(@PathVariable Integer userId){
        return ResponseEntity.ok(authService.deleteUser(userId));
    }

    @GetMapping("/paginateUsers")
    public Page<User> getUsers(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return authService.allUsers(page, size);
    }

    @GetMapping("/current-user")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof User) {
            User user = (User) authentication.getPrincipal();
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
    }

    @GetMapping("/controls/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        boolean isUsernameAvailable = authService.isUsernameAvailable(username);

        if (isUsernameAvailable) {
            return ResponseEntity.ok().body(Map.of("isAvailable", true));
        } else {
            return ResponseEntity.ok().body(Map.of("isAvailable", false));
        }
    }

    @GetMapping("/controls/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        boolean isEmailAvailable = authService.isEmailAvailable(email);

        if (isEmailAvailable) {
            return ResponseEntity.ok().body(Map.of("isAvailable", true));
        } else {
            return ResponseEntity.ok().body(Map.of("isAvailable", false));
        }
    }

    @PostMapping("/upload-profile-image")
    public ResponseEntity<String> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String token) {

        try {
            authService.saveProfileImage(file, token);
            return ResponseEntity.ok("Profile image uploaded successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading image: " + e.getMessage());
        }
    }

    @PostMapping("/update-profile-image/{userId}")
    public ResponseEntity<String> updateProfileImage(
            @PathVariable Integer userId,
            @RequestParam("file") MultipartFile file) {

        try {
            authService.updateUserProfileImage(userId, file);
            return ResponseEntity.ok("Profile image updated successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating profile image: " + e.getMessage());
        }
    }


}