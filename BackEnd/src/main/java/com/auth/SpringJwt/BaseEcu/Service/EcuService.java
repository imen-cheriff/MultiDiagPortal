package com.auth.SpringJwt.BaseEcu.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EcuService {

    @Autowired
    private NamedParameterJdbcTemplate jdbc;

    public List<Map<String, Object>> getAllEcus() {
        String sql = "SELECT \"NomEcu\" FROM public.\"ECU\"";
        return jdbc.queryForList(sql, new HashMap<>());
    }

//    public List<Map<String, Object>> getEcuByCar() {
//        String sql = "SELECT \"IdEcu\", \"NomEcu\", \"IdFamille\" FROM public.\"ECU\"";
//        return jdbc.queryForList(sql, new HashMap<>());
//    }
//  i need to get ecus by vehicule id

}
