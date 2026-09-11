package com.auth.SpringJwt.BaseEcu.Controller;

import com.auth.SpringJwt.BaseEcu.Service.TypeDevService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/base-ecu/type-dev")
public class TypeDevController {

    @Autowired
    private TypeDevService typeDevService;

    @GetMapping
    public ResponseEntity<?> getAllTypeDev() {
        return ResponseEntity.ok(typeDevService.getAllTypeDev());
    }
}
