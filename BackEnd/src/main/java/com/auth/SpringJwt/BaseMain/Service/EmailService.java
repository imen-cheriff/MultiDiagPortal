package com.auth.SpringJwt.BaseMain.Service;

import com.auth.SpringJwt.BaseMain.Model.User;
import com.auth.SpringJwt.BaseMain.Util.EmailTemplateUtil;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private EmailTemplateUtil templateUtil;

    public void sendVerificationEmail(User user, String token, String tempPassword) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject("Account Verification");

            String emailContent = templateUtil.getVerificationEmailTemplate(user.getUsername(), token, tempPassword);
            helper.setText(emailContent, true); // 'true' enables HTML content

            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

}