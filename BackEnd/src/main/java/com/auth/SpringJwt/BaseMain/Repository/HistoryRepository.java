package com.auth.SpringJwt.BaseMain.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.auth.SpringJwt.BaseMain.Model.HistoryAction;
import com.auth.SpringJwt.BaseMain.Model.HistoryAction.EntityType;

@Repository
public interface HistoryRepository extends JpaRepository<HistoryAction, Long> {
    List<HistoryAction> findByEntityTypeAndEntityId(EntityType entityType, Long entityId);


}