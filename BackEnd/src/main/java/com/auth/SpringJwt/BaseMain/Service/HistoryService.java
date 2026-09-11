package com.auth.SpringJwt.BaseMain.Service;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;

import com.auth.SpringJwt.BaseMain.DTO.AuthenticationResponse;
import com.auth.SpringJwt.BaseMain.Model.Car;
import com.auth.SpringJwt.BaseMain.Model.Carto;
import com.auth.SpringJwt.BaseMain.Model.User;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.auth.SpringJwt.BaseMain.DTO.HistoryActionDTO;
import com.auth.SpringJwt.BaseMain.Model.HistoryAction;
import com.auth.SpringJwt.BaseMain.Model.HistoryAction.EntityType;
import com.auth.SpringJwt.BaseMain.Repository.HistoryRepository;

@Service
public class HistoryService {

    @Autowired
    private HistoryRepository historyRepository;

    public List<HistoryAction> getAllHistory() {
        return historyRepository.findAll();
    }

    public List<HistoryAction> getHistoryByCartoId(Long cartoId) {
        return historyRepository.findByEntityTypeAndEntityId(EntityType.carto, cartoId);
    }

    public void deleteAllHistory() {
        historyRepository.deleteAll();
    }

    public void deleteAction(Long actionId) {
        historyRepository.deleteById(actionId);
    }

    public HistoryAction logAction(HistoryActionDTO actionDTO) {
        HistoryAction action = new HistoryAction();
        action.setActionType(actionDTO.getActionType());
        action.setEntityType(actionDTO.getEntityType());
        action.setEntityId(actionDTO.getEntityId());
        action.setEntityName(actionDTO.getEntityName());
        action.setUserId(actionDTO.getUserId());
        action.setUserName(actionDTO.getUserName());
        action.setDetails(actionDTO.getDetails());
        action.setTimestamp(LocalDateTime.now());

        return historyRepository.save(action);
    }
}
