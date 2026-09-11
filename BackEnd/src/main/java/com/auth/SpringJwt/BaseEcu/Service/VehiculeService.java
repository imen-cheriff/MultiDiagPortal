package com.auth.SpringJwt.BaseEcu.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class VehiculeService {

    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedJdbcTemplate;

    @Autowired
    public VehiculeService(
            @Qualifier("secondaryJdbcTemplate") JdbcTemplate jdbcTemplate,
            @Qualifier("secondaryNamedJdbcTemplate") NamedParameterJdbcTemplate namedJdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.namedJdbcTemplate = namedJdbcTemplate;
    }

    public Map<String, Object> getVehiclesPaginated(int page, int size) {
        // Calculate offset
        int offset = page * size;

        // Get paginated data
        String sql = "SELECT \"CODE_VEH\", \"NOMVEH\", \"NOMINTERNE\", \"TESTGLOBAL\", \"IdMarque\" " +
                "FROM public.\"Vehid\" ORDER BY \"CODE_VEH\" LIMIT :limit OFFSET :offset";

        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("limit", size);
        params.addValue("offset", offset);

        List<Map<String, Object>> vehicles = namedJdbcTemplate.queryForList(sql, params);

        // Get total count for pagination info
        String countSql = "SELECT COUNT(*) FROM public.\"Vehid\"";
        Integer totalItems = jdbcTemplate.queryForObject(countSql, Integer.class);

        Map<String, Object> response = new HashMap<>();
        response.put("content", vehicles);
        response.put("totalItems", totalItems);
        response.put("totalPages", (int) Math.ceil((double) totalItems / size));
        response.put("currentPage", page);

        return response;
    }

    public Map<String, Object> getVehiclesWithBrands(int page, int size) {
        // Calculate offset
        int offset = page * size;

        // Get paginated data with brand information using join
        String sql = "SELECT v.\"CODE_VEH\", v.\"NOMVEH\", v.\"NOMINTERNE\", v.\"TESTGLOBAL\", " +
                "m.\"CODMAR\", m.\"NOMMAR\" " +
                "FROM public.\"Vehid\" v " +
                "LEFT JOIN public.\"Marque\" m ON v.\"IdMarque\" = m.\"CODMAR\" " +
                "ORDER BY v.\"CODE_VEH\" LIMIT :limit OFFSET :offset";

        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("limit", size);
        params.addValue("offset", offset);

        List<Map<String, Object>> vehiclesWithBrands = namedJdbcTemplate.queryForList(sql, params);

        // Get total count for pagination info
        String countSql = "SELECT COUNT(*) FROM public.\"Vehid\"";
        Integer totalItems = jdbcTemplate.queryForObject(countSql, Integer.class);

        Map<String, Object> response = new HashMap<>();
        response.put("content", vehiclesWithBrands);
        response.put("totalItems", totalItems);
        response.put("totalPages", (int) Math.ceil((double) totalItems / size));
        response.put("currentPage", page);

        return response;
    }

    public List<Map<String, Object>> getVehiculesByMarque(Integer codmar) {
        String sql = "SELECT v.\"CODE_VEH\", v.\"NOMVEH\", v.\"NOMINTERNE\", v.\"TESTGLOBAL\", " +
                "v.\"IdMarque\", m.\"NOMMAR\" " +
                "FROM public.\"Vehid\" v " +
                "LEFT JOIN public.\"Marque\" m ON v.\"IdMarque\" = m.\"CODMAR\" " +
                "WHERE v.\"IdMarque\" = :codmar";

        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("codmar", codmar);

        return namedJdbcTemplate.queryForList(sql, params);
    }

}


