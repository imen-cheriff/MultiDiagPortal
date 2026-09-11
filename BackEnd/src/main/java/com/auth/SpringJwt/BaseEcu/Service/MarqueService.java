package com.auth.SpringJwt.BaseEcu.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class MarqueService {

    private JdbcTemplate jdbcTemplate;
    private NamedParameterJdbcTemplate namedJdbcTemplate;

    @Autowired
    public void SecondaryDbService(
            @Qualifier("secondaryJdbcTemplate") JdbcTemplate jdbcTemplate,
            @Qualifier("secondaryNamedJdbcTemplate") NamedParameterJdbcTemplate namedJdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.namedJdbcTemplate = namedJdbcTemplate;
    }

    public MarqueService(JdbcTemplate jdbcTemplate, NamedParameterJdbcTemplate namedJdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.namedJdbcTemplate = namedJdbcTemplate;
    }

    // Example method using simple JdbcTemplate
    public List<Map<String, Object>> getAllMarques() {
        String sql = "SELECT \"CODMAR\", \"NOMMAR\" FROM public.\"Marque\"";
        return jdbcTemplate.queryForList(sql);
    }

    // Example method using NamedParameterJdbcTemplate
    public List<Map<String, Object>> getMarquesByCondition( String column, Object value) {
        String sql = "SELECT * FROM public.\"Marque\"" + " WHERE " + column + " = :value";

        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("value", value);

        return namedJdbcTemplate.queryForList(sql, params);
    }

    public Map<String, Object> getMarquesPaginated(int page, int size) {
        // Calculate offset
        int offset = page * size;

        // Get paginated data
        String sql = "SELECT \"CODMAR\", \"NOMMAR\" FROM public.\"Marque\" ORDER BY \"CODMAR\" LIMIT :limit OFFSET :offset";

        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("limit", size);
        params.addValue("offset", offset);

        List<Map<String, Object>> marques = namedJdbcTemplate.queryForList(sql, params);

        // Get total count for pagination info
        String countSql = "SELECT COUNT(*) FROM \"Marque\"";
        Integer totalItems = jdbcTemplate.queryForObject(countSql, Integer.class);

        Map<String, Object> response = new HashMap<>();
        response.put("content", marques);
        response.put("totalItems", totalItems);
        response.put("totalPages", (int) Math.ceil((double) totalItems / size));
        response.put("currentPage", page);

        return response;
    }

    public List<Map<String, Object>> getAllVahicule() {
        String sql = "SELECT \"CODMAR\", \"NOMMAR\" FROM public.\"Marque\"";
        return jdbcTemplate.queryForList(sql);
    }
}