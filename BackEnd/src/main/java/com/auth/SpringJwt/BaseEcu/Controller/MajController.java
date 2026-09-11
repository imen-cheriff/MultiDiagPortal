package com.auth.SpringJwt.BaseEcu.Controller;

import com.auth.SpringJwt.BaseEcu.Service.MajService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/base-ecu/majs")
public class MajController {

    @Autowired
    private MajService majService;

    @GetMapping
    public ResponseEntity<?> getAllMajs() {
        return ResponseEntity.ok(majService.getAllMajs());
    }
}
