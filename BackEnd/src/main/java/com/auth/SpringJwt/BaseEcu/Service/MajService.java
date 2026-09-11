package com.auth.SpringJwt.BaseEcu.Service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MajService {

    @Autowired
    private NamedParameterJdbcTemplate jdbc;

    public List<Map<String, Object>> getAllMajs() {
        String sql = "SELECT \"IdMaj\", \"NomMaj\" FROM public.\"MAJ\"";
        return jdbc.queryForList(sql, new HashMap<>());
    }
}
