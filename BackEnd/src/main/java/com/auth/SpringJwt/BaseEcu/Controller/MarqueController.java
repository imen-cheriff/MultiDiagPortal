package com.auth.SpringJwt.BaseEcu.Controller;

import com.auth.SpringJwt.BaseEcu.Service.MarqueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/base-ecu/marques")
public class MarqueController {

    private final MarqueService marqueService;

    @Autowired
    public MarqueController(MarqueService marqueService) {
        this.marqueService = marqueService;
    }

    @GetMapping()
    public ResponseEntity<?> getSecondaryData() {
        List<Map<String, Object>> data = marqueService.getAllMarques();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/paginated")
    public ResponseEntity<?> getMarquesPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Map<String, Object> response = marqueService.getMarquesPaginated(page, size);
        return ResponseEntity.ok(response);
    }
}
