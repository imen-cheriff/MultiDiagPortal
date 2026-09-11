package com.auth.SpringJwt.BaseMain.Util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class EmailTemplateUtil {
    @Value("${app.verification.base-url}")
    private String baseUrl;

    public String getVerificationEmailTemplate(String username, String token, String tempPassword) {
        String verificationUrl = baseUrl + token;

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "  <meta charset='UTF-8'>" +
                "  <style>" +
                "    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 20px; color: #4a4a4a; }" +
                "    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden; }" +
                "    .header { text-align: center; background: linear-gradient(135deg, #5cb85c 0%, #3d9c3d 100%); color: white; padding: 25px 0; font-size: 24px; letter-spacing: 0.5px; }" +
                "    .content { padding: 30px; color: #555555; line-height: 1.6; }" +
                "    .content p { margin-bottom: 18px; }" +
                "    .content a { color: #000000 !important; text-decoration: none !important; }" + /* Added this line for all content links */
                "    .credentials { background-color: #f5f9f5; border-left: 4px solid #5cb85c; padding: 20px; border-radius: 6px; margin: 25px 0; box-shadow: 0 2px 6px rgba(92,184,92,0.1); }" +
                "    .credentials p { margin: 10px 0; color: #4a4a4a; }" +
                "    .button-container { text-align: center; margin: 35px 0; }" +
                "    .verify-button { background: linear-gradient(to bottom, #5cb85c 0%, #4cae4c 100%); color: white !important; padding: 14px 30px; text-decoration: none !important; font-size: 16px; border-radius: 50px; display: inline-block; font-weight: 600; box-shadow: 0 4px 8px rgba(92,184,92,0.25); transition: all 0.3s ease; }" +
                "    .verify-button:hover { background: linear-gradient(to bottom, #4cae4c 0%, #3d9c3d 100%); box-shadow: 0 6px 12px rgba(92,184,92,0.3); transform: translateY(-2px); }" +
                "    .divider { height: 1px; background-color: #e9e9e9; margin: 25px 0; }" +
                "    .highlight { color: #5cb85c; font-weight: 600; }" +
                "    .footer { font-size: 13px; color: #999999; text-align: center; margin-top: 20px; padding: 20px; background-color: #f5f9f5; border-top: 1px solid #e9f3e9; }" +
                "    .footer a { color: #000000 !important; text-decoration: none !important; }" + /* Added this line for footer links */
                "    a { color: #000000 !important; text-decoration: none !important; }" + /* Added this general rule for all links */
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>Account Verification</div>" +
                "    <div class='content'>" +
                "      <p>Hello <span class='highlight'>" + username + "</span>,</p>" +
                "      <p>Thank you for creating an account with us. We're excited to have you on board! Please use the credentials below for your first login:</p>" +
                "      <div class='credentials'>" +
                "        <p><strong>Username:</strong> " + username + "</p>" +
                "        <p><strong>Temporary Password:</strong> " + tempPassword + "</p>" +
                "      </div>" +
                "      <p>To activate your account, please click the button below to verify your email address:</p>" +
                "      <div class='button-container'>" +
                "        <a class='verify-button' href='" + verificationUrl + "' style='color: white !important; text-decoration: none !important;'>Verify My Email</a>" +
                "      </div>" +
                "      <p>This verification link will expire in 24 hours. After logging in, you'll be prompted to change your password for security purposes.</p>" +
                "      <div class='divider'></div>" +
                "      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>" +
                "      <p>Best regards,<br>The Team</p>" +
                "    </div>" +
                "    <div class='footer'>" +
                "      © 2025 Your App Name. All rights reserved.<br>" +
                "      <small>This is an automated email, please do not reply.</small>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }
}
