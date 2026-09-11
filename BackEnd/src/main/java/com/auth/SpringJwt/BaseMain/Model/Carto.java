package com.auth.SpringJwt.BaseMain.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;


@Entity
@Table(name = "cartos")
public class Carto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private final String prefix = "Carto-";
    private String name;
    private String outil;

    @Column(nullable = true, updatable = false)
    private LocalDateTime creationDate;

//    @Column(nullable = true, updatable = true)
//    private LocalDateTime lastupdateDate;

    private String version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    @JsonIgnore
    private Car car;

    @OneToMany(mappedBy = "carto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Family> families;

    public Carto() {
        this.creationDate = LocalDateTime.now(); // Automatically sets the creation date
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {this.id = id;}

    public String getName() {return name;}

    public void setName(String name) {
        this.name = name;
    }

    public String getOutil() {
        return outil;
    }

    public void setOutil(String outil) {
        this.outil = outil;
    }

    public String getVersion() {return version;}

    public void setVersion(String version) {this.version = version;}

    public LocalDateTime getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(LocalDateTime creationDate) {
        this.creationDate = creationDate;
    }

    public Car getCar() {
        return car;
    }

    public void setCar(Car car) {
        this.car = car;
    }

    public List<Family> getFamilies() {
        return families;
    }

    public void setFamilies(List<Family> families) {
        this.families = families;
        for (Family family : families) {
            family.setCarto(this);
        }
    }

    @Enumerated(EnumType.STRING)
    private CartoStatus status = CartoStatus.PENDING; // Default value

    // Getters and setters
    public CartoStatus getStatus() {
        return status;
    }

    public void setStatus(CartoStatus status) {this.status = status;}
}