package com.auth.SpringJwt.BaseEcu.Controller;

import com.auth.SpringJwt.BaseEcu.Service.EcuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/base-ecu/ecus")
public class EcuController {

    @Autowired
    private EcuService ecuService;

    @GetMapping
    public ResponseEntity<?> getAllEcus() {
        return ResponseEntity.ok(ecuService.getAllEcus());
    }
}
