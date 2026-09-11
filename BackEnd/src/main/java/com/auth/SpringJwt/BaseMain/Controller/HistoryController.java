package com.auth.SpringJwt.BaseMain.Controller;

import java.util.List;
import java.util.Optional;

import com.auth.SpringJwt.BaseMain.Model.Car;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.auth.SpringJwt.BaseMain.DTO.HistoryActionDTO;
import com.auth.SpringJwt.BaseMain.Model.HistoryAction;
import com.auth.SpringJwt.BaseMain.Service.HistoryService;

@CrossOrigin(origins = "http://localhost:4204")
@RestController
@RequestMapping("/api/history")
public class HistoryController {

    @Autowired
    private HistoryService historyService;

    @GetMapping
    public ResponseEntity<List<HistoryAction>> getAllHistory() {
        return ResponseEntity.ok(historyService.getAllHistory());
    }

    @GetMapping("/carto/{cartoId}")
    public ResponseEntity<List<HistoryAction>> getHistoryByCartoId(@PathVariable Long cartoId) {
        return ResponseEntity.ok(historyService.getHistoryByCartoId(cartoId));
    }

    @PostMapping
    public ResponseEntity<HistoryAction> logAction(@RequestBody HistoryActionDTO actionDTO) {
        HistoryAction savedAction = historyService.logAction(actionDTO);
        return new ResponseEntity<>(savedAction, HttpStatus.CREATED);
    }

    @DeleteMapping("/actions/{actionId}")
    public ResponseEntity<Void> deleteAction(@PathVariable Long actionId) {
        historyService.deleteAction(actionId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAll() {
        historyService.deleteAllHistory();
        return ResponseEntity.noContent().build();
    }
}
