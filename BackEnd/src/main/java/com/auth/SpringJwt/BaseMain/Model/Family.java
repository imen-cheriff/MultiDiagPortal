package com.auth.SpringJwt.BaseMain.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "families")
public class Family {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carto_id", nullable = false)
    private Carto carto;
    @OneToMany(mappedBy = "family", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Ecu> ecus;

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

    public Carto getCarto() {
        return carto;
    }

    public void setCarto(Carto carto) {
        this.carto = carto;
    }

    public List<Ecu> getEcus() {
        return ecus;
    }

    public void setEcus(List<Ecu> ecus) {
        this.ecus = ecus;
        for (Ecu ecu : ecus) {
            ecu.setFamily(this);
        }
    }
}