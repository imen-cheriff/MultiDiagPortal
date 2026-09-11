package com.auth.SpringJwt.BaseMain.Util;

import java.security.SecureRandom;

public class PasswordGenerator {
    private static final String CHAR_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    public static String generateRandomPassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder(10);

        for (int i = 0; i < 10; i++) {
            int randomIndex = random.nextInt(CHAR_POOL.length());
            password.append(CHAR_POOL.charAt(randomIndex));
        }

        return password.toString();
    }
}