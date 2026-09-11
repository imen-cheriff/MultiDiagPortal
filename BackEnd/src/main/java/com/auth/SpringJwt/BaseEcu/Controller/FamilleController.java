package com.auth.SpringJwt.BaseEcu.Controller;

import com.auth.SpringJwt.BaseEcu.Service.FamilleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/base-ecu/familles")
public class FamilleController {

    @Autowired
    private FamilleService familleService;

    @GetMapping
    public ResponseEntity<?> getAllFamilles() {
        return ResponseEntity.ok(familleService.getAllFamilles());
    }
}

