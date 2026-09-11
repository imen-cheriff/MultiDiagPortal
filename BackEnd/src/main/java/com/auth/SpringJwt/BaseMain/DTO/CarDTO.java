package com.auth.SpringJwt.BaseMain.DTO;

import java.util.List;

public class CarDTO {

    private String brand;
    private String model;
    private List<EcuDTO> ecus;

    // Getters and Setters

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public List<EcuDTO> getEcus() {
        return ecus;
    }

    public void setEcus(List<EcuDTO> ecus) {
        this.ecus = ecus;
    }
}