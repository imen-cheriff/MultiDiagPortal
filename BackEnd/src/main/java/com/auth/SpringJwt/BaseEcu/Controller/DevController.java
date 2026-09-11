package com.auth.SpringJwt.BaseEcu.Controller;

import com.auth.SpringJwt.BaseEcu.Service.DevService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/base-ecu/devs")
public class DevController {

    @Autowired
    private DevService devService;

    @GetMapping
    public ResponseEntity<?> getAllDevsWithDetails() {
        return ResponseEntity.ok(devService.getAllDevWithDetails());
    }

    @GetMapping("/by-vehicule")
    public ResponseEntity<?> getVehiculesWithDevs() {
        return ResponseEntity.ok(devService.getVehiculesWithDevs());
    }

    @GetMapping("/{vehiculeId}")
    public ResponseEntity<?> getDevsByVehicule(@PathVariable Integer vehiculeId) {
        List<Map<String, Object>> devs = devService.getDevsByVehiculeId(vehiculeId);
        return ResponseEntity.ok(devs);
    }

    @GetMapping("/vehicules/{vehiculeId}")
    public ResponseEntity<?> getDetailedDevsByVehicule(@PathVariable Integer vehiculeId) {
        return ResponseEntity.ok(devService.getDevsWithDetailsByVehiculeId(vehiculeId));
    }

    @GetMapping("/vehicules/{vehiculeId}/details")
    public ResponseEntity<?> getStructuredDevsByVehiculeId(@PathVariable Integer vehiculeId) {
        Map<String, Object> result = devService.getStructuredDevsByVehiculeId(vehiculeId);
        if (result.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }


}
