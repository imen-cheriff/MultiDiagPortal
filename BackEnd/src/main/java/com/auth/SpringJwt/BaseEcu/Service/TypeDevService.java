package com.auth.SpringJwt.BaseEcu.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TypeDevService {

    @Autowired
    private NamedParameterJdbcTemplate jdbc;

    public List<Map<String, Object>> getAllTypeDev() {
        String sql = "SELECT \"IdTypeDev\", \"NomTypeDev\" FROM public.\"TYPE_DEV\"";
        return jdbc.queryForList(sql, new HashMap<>());
    }
}
