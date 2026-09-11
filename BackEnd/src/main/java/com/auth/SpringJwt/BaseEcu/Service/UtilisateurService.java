package com.auth.SpringJwt.BaseEcu.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UtilisateurService {

    @Autowired
    private NamedParameterJdbcTemplate jdbc;

    public List<Map<String, Object>> getAllUtilisateurs() {
        String sql = "SELECT \"IdUtilisateur\", \"Nom\", \"Prenom\" FROM public.\"UTILISATEUR\"";
        return jdbc.queryForList(sql, new HashMap<>());
    }
}

