package com.auth.SpringJwt.BaseEcu.Controller;

import com.auth.SpringJwt.BaseEcu.Service.VehiculeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/base-ecu/vehicules")
public class VehiculeController {

    private final VehiculeService vehiculeService;

    @Autowired
    public VehiculeController(VehiculeService vehiculeService) {
        this.vehiculeService = vehiculeService;
    }

    @GetMapping("/paginated")
    public ResponseEntity<?> getVehiclesPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Map<String, Object> response = vehiculeService.getVehiclesPaginated(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/withBrands")
    public ResponseEntity<?> getVehiclesWithBrands(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Map<String, Object> response = vehiculeService.getVehiclesWithBrands(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-marque/{codmar}")
    public ResponseEntity<?> getVehiculesByMarque(@PathVariable Integer codmar) {
        List<Map<String, Object>> vehicules = vehiculeService.getVehiculesByMarque(codmar);
        return ResponseEntity.ok(vehicules);
    }

}
