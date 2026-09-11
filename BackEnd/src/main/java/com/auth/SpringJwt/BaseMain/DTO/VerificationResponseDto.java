package com.auth.SpringJwt.BaseMain.DTO;

public class VerificationResponseDto {
    private String message;

    public VerificationResponseDto() {
    }

    public VerificationResponseDto(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
