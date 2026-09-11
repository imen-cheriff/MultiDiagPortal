package com.auth.SpringJwt.BaseEcu.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FamilleService {

    @Autowired
    private NamedParameterJdbcTemplate jdbc;

    public List<Map<String, Object>> getAllFamilles() {
        String sql = "SELECT \"IdFamille\", \"Nomfamille\" FROM public.\"FAMILLE\"";
        return jdbc.queryForList(sql, new HashMap<>());
    }
}
