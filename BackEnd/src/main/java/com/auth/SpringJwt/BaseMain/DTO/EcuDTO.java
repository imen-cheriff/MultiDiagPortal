package com.auth.SpringJwt.BaseMain.DTO;

public class EcuDTO {

    private String name;
    private String reco;
    private Integer mpm;
    private String ident;
    private String ta;
    private Integer fa;

    private String protocol;

    // Getters and Setters


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getReco() {
        return reco;
    }

    public void setReco(String reco) {
        this.reco = reco;
    }

    public Integer getMpm() {
        return mpm;
    }

    public void setMpm(Integer mpm) {
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

    public Integer getFa() {
        return fa;
    }

    public void setFa(Integer fa) {
        this.fa = fa;
    }

    public String getProtocol() {
        return protocol;
    }

    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }
}