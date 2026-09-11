package com.auth.SpringJwt.BaseEcu.Controller;

import com.auth.SpringJwt.BaseEcu.Service.EtatDevService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/base-ecu/etat-dev")
public class EtatDevController {

    @Autowired
    private EtatDevService etatDevService;

    @GetMapping
    public ResponseEntity<?> getAllEtatDev() {
        return ResponseEntity.ok(etatDevService.getAllEtatDev());
    }
}
