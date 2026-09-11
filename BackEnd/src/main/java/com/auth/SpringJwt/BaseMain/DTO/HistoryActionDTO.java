package com.auth.SpringJwt.BaseMain.DTO;

import com.auth.SpringJwt.BaseMain.Model.HistoryAction.ActionType;
import com.auth.SpringJwt.BaseMain.Model.HistoryAction.EntityType;
import jakarta.persistence.Column;

public class HistoryActionDTO {
    private ActionType actionType;
    private EntityType entityType;
    private Long entityId;
    private String entityName;
    @Column(nullable = true)
    private Integer userId;
    private String userName;
    private String details;

    // Getters and setters
    public ActionType getActionType() {
        return actionType;
    }

    public void setActionType(ActionType actionType) {
        this.actionType = actionType;
    }

    public EntityType getEntityType() {
        return entityType;
    }

    public void setEntityType(EntityType entityType) {
        this.entityType = entityType;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
