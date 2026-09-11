package com.auth.SpringJwt.BaseMain.Model;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "brands")
public class Brand {
    @Id
    private Long id;
    private String name;
    @OneToMany(mappedBy = "brand", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Car> cars;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Car> getCars() {
        return cars;
    }

    public void setCars(List<Car> cars) {
        this.cars = cars;
        for (Car car : cars) {
            car.setBrand(this);
        }
    }
}