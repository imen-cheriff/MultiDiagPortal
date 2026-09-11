package com.auth.SpringJwt.Config;

import com.auth.SpringJwt.BaseMain.Model.User;
import com.auth.SpringJwt.BaseMain.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if users already exists
        if (!userRepository.existsByUsername("admin") && !userRepository.existsByUsername("manager") && !userRepository.existsByUsername("user") && !userRepository.existsByUsername("team leader")) {
            User adminUser = new User();
            User mngrUser = new User();
            User user = new User();
            User tlUser = new User();

            adminUser.setUsername("admin");
            mngrUser.setUsername("manager");
            user.setUsername("user");
            tlUser.setUsername("teamleader");

            // Set password with encoding
            adminUser.setPassword(passwordEncoder.encode("admin"));
            mngrUser.setPassword(passwordEncoder.encode("manager"));
            user.setPassword(passwordEncoder.encode("user"));
            tlUser.setPassword(passwordEncoder.encode("teamleader"));

            // Set email
            adminUser.setEmail("admin@example.com");
            mngrUser.setEmail("manager@example.com");
            user.setEmail("user@example.com");
            tlUser.setEmail("teamleader@example.com");

            // Set role
            adminUser.setRole("ADMIN");
            mngrUser.setRole("MANAGER");
            user.setRole("USER");
            tlUser.setRole("TEAM LEADER");

            // Set full name
            adminUser.setFullName("Administrator");
            mngrUser.setFullName("Manager");
            user.setFullName("User");
            tlUser.setFullName("Team Leader");

            // Set first name
            adminUser.setFirstName("Admin");
            mngrUser.setFirstName("Manager");
            user.setFirstName("User");
            tlUser.setFirstName("TL");

            // Set as email verified
            adminUser.setEmailVerified(true);
            mngrUser.setEmailVerified(true);
            user.setEmailVerified(true);
            tlUser.setEmailVerified(true);

            // Save the admin user
            userRepository.save(adminUser);
            userRepository.save(mngrUser);
            userRepository.save(user);
            userRepository.save(tlUser);

            System.out.println("Admin user & Manager user have been created");
        } else {
            System.out.println("Admin user & Manager user already exist");
        }
    }
}