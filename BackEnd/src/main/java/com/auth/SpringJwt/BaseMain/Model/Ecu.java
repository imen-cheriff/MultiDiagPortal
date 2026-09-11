package com.auth.SpringJwt.BaseMain.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "ecus")
public class Ecu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "Motorisation")
    private String Motorisation;
    @Column(name = "Type")
    private String Type;
    private String name;
    private String perimetre;
    private String reco;
    private String mpm;
    private String ident;
    private String ta;
    private String fa;
    private String protocol;
    private String address;
    private String PIN;
    private String sa;
    private String respDev;
    private String etatDev;
    private String typeDev;

    // Optional attributes
    @Column(nullable = true)
    private String objectifCible;

    @Column(nullable = true)
    private String mdsd;

    @Column(nullable = true)
    private String cibleLivraison;

    @Column(nullable = true)
    private String comparaisonEntre;

    @Column(nullable = true)
    private Integer estimationChiffrage;

    @Column(nullable = true)
    private Date creationDate;

    @PrePersist
    public void prePersist() {
        this.creationDate = new Date(); // Automatically set to today's date when saving
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_id", nullable = false)
    @JsonIgnore
    private Family family;

    // Getters and Setters (unchanged from your original Ecu class)
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getMotorisation() {
        return Motorisation;
    }

    public void setMotorisation(String motorisation) {
        Motorisation = motorisation;
    }

    public String getType() {
        return Type;
    }

    public void setType(String type) {
        Type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPerimetre() {
        return perimetre;
    }

    public void setPerimetre(String perimetre) {
        this.perimetre = perimetre;
    }

    public String getReco() {
        return reco;
    }

    public void setReco(String reco) {
        this.reco = reco;
    }

    public String getMpm() {
        return mpm;
    }

    public void setMpm(String mpm) {
        this.mpm = mpm;
    }

    public String getIdent() {
        return ident;
    }

    public void setIdent(String ident) {
        this.ident = ident;
    }

    public String getTa() {
        return ta;
    }

    public void setTa(String ta) {
        this.ta = ta;
    }

    public String getFa() {
        return fa;
    }

    public void setFa(String fa) {
        this.fa = fa;
    }

    public String getProtocol() {
        return protocol;
    }

    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPIN() {
        return PIN;
    }

    public void setPIN(String PIN) {
        this.PIN = PIN;
    }

    public String getSa() {
        return sa;
    }

    public void setSa(String sa) {
        this.sa = sa;
    }

    public String getRespDev() {
        return respDev;
    }

    public void setRespDev(String respDev) {
        this.respDev = respDev;
    }

    public String getEtatDev() {
        return etatDev;
    }

    public void setEtatDev(String etatDev) {
        this.etatDev = etatDev;
    }

    public String getTypeDev() {return typeDev;}

    public void setTypeDev(String typeDev) {this.typeDev = typeDev;}

    public String getObjectifCible() {
        return objectifCible;
    }

    public void setObjectifCible(String objectifCible) {
        this.objectifCible = objectifCible;
    }

    public String getmdsd() {
        return mdsd;
    }

    public void setmdsd(String mdsd) {
        this.mdsd = mdsd;
    }

    public String getCibleLivraison() {
        return cibleLivraison;
    }

    public void setCibleLivraison(String cibleLivraison) {
        this.cibleLivraison = cibleLivraison;
    }

    public String getComparaisonEntre() {
        return comparaisonEntre;
    }

    public void setComparaisonEntre(String comparaisonEntre) {
        this.comparaisonEntre = comparaisonEntre;
    }

    public Integer getEstimationChiffrage() {
        return estimationChiffrage;
    }

    public void setEstimationChiffrage(Integer estimationChiffrage) {
        this.estimationChiffrage = estimationChiffrage;
    }

    public Date getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }

    public Family getFamily() {
        return family;
    }

    public void setFamily(Family family) {
        this.family = family;
    }
}