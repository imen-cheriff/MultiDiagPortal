package com.auth.SpringJwt.BaseMain.Controller;

import com.auth.SpringJwt.BaseMain.Service.VerificationService;
import com.auth.SpringJwt.BaseMain.DTO.EmailRequestDto;
import com.auth.SpringJwt.BaseMain.DTO.VerificationResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/verification")
public class VerificationController {
    @Autowired
    private VerificationService verificationService;

    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String token) {
        String result = verificationService.validateVerificationToken(token);

        if (result.equals("valid")) {
            return ResponseEntity.ok(new VerificationResponseDto("Email verified successfully"));
        }

        return ResponseEntity.badRequest().body(new VerificationResponseDto(
                result.equals("expired") ? "Token expired" : "Invalid token"));
    }

    @PostMapping("/resend")
    public ResponseEntity<?> resendVerificationToken(@RequestBody EmailRequestDto request) {
        // Logic to find user by email and resend verification
        verificationService.resendVerificationToken(request.getEmail());
        return ResponseEntity.ok(new VerificationResponseDto("Verification email sent"));
    }
}