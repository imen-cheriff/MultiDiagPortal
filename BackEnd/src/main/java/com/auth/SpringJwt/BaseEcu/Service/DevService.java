package com.auth.SpringJwt.BaseEcu.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DevService {

    @Autowired
    private NamedParameterJdbcTemplate jdbc;

    public List<Map<String, Object>> getAllDevWithDetails() {
        String sql = """
            SELECT d."IdDev", d."NomDev", 
                   u."Nom" AS "NomUtilisateur", u."Prenom",
                   e."NomEcu", f."Nomfamille",
                   m."NomMaj",
                   ed."NomEtatDev",
                   td."NomTypeDev",
                   dp."NomDev" AS "NomDevPrecedent",
                   d."DevComment"
            FROM public."DEV" d
            LEFT JOIN public."UTILISATEUR" u ON d."IdRC" = u."IdUtilisateur"
            LEFT JOIN public."ECU" e ON d."IdEcu" = e."IdEcu"
            LEFT JOIN public."FAMILLE" f ON e."IdFamille" = f."IdFamille"
            LEFT JOIN public."MAJ" m ON d."IdMaj" = m."IdMaj"
            LEFT JOIN public."ETAT_DEV" ed ON d."IdEtatDev" = ed."IdEtatDev"
            LEFT JOIN public."TYPE_DEV" td ON d."IdTypeDev" = td."IdTypeDev"
            LEFT JOIN public."DEV" dp ON d."DevPrecedent" = dp."IdDev"
        """;

        return jdbc.queryForList(sql, new HashMap<>());
    }

    public List<Map<String, Object>> getVehiculesWithDevs() {
        String sql = """
        SELECT v."CODE_VEH", v."NOMVEH", v."NOMINTERNE", v."IdMarque",
               d."IdDev", d."NomDev", d."DevComment"
        FROM public."VEH_BY_DEV" vb
        JOIN public."Vehid" v ON vb."GRPMOD" = v."CODE_VEH"
        JOIN public."DEV" d ON vb."IdDev" = d."IdDev"
        ORDER BY v."CODE_VEH"
    """;

        return jdbc.queryForList(sql, new HashMap<>());
    }

    public List<Map<String, Object>> getDevsByVehiculeId(Integer vehiculeId) {
        String sql = """
        SELECT d."IdDev", d."NomDev", d."DevComment",
               v."CODE_VEH", v."NOMVEH", v."NOMINTERNE"
        FROM public."VEH_BY_DEV" vb
        JOIN public."DEV" d ON vb."IdDev" = d."IdDev"
        JOIN public."Vehid" v ON vb."GRPMOD" = v."CODE_VEH"
        WHERE v."CODE_VEH" = :vehiculeId
        ORDER BY d."IdDev"
    """;

        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("vehiculeId", vehiculeId);

        return jdbc.queryForList(sql, params);
    }

    public List<Map<String, Object>> getDevsWithDetailsByVehiculeId(Integer vehiculeId) {
        String sql = """
        SELECT d."IdDev", d."NomDev", d."DevComment",
               v."CODE_VEH", v."NOMVEH", v."NOMINTERNE",
               u."Nom" AS "NomUtilisateur", u."Prenom",
               e."NomEcu", f."Nomfamille",
               m."NomMaj",
               ed."NomEtatDev",
               td."NomTypeDev",
               dp."NomDev" AS "NomDevPrecedent"
        FROM public."VEH_BY_DEV" vb
        JOIN public."Vehid" v ON vb."GRPMOD" = v."CODE_VEH"
        JOIN public."DEV" d ON vb."IdDev" = d."IdDev"
        LEFT JOIN public."UTILISATEUR" u ON d."IdRC" = u."IdUtilisateur"
        LEFT JOIN public."ECU" e ON d."IdEcu" = e."IdEcu"
        LEFT JOIN public."FAMILLE" f ON e."IdFamille" = f."IdFamille"
        LEFT JOIN public."MAJ" m ON d."IdMaj" = m."IdMaj"
        LEFT JOIN public."ETAT_DEV" ed ON d."IdEtatDev" = ed."IdEtatDev"
        LEFT JOIN public."TYPE_DEV" td ON d."IdTypeDev" = td."IdTypeDev"
        LEFT JOIN public."DEV" dp ON d."DevPrecedent" = dp."IdDev"
        WHERE v."CODE_VEH" = :vehiculeId
        ORDER BY d."IdDev"
    """;

        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("vehiculeId", vehiculeId);

        return jdbc.queryForList(sql, params);
    }

    public Map<String, Object> getStructuredDevsByVehiculeId(Integer vehiculeId) {
        String sql = """
        SELECT d."IdDev", d."NomDev", d."DevComment",
               v."CODE_VEH", v."NOMVEH", v."NOMINTERNE",
               u."Nom" AS "NomUtilisateur", u."Prenom",
               e."NomEcu", f."Nomfamille",
               m."NomMaj",
               ed."NomEtatDev",
               td."NomTypeDev",
               dp."NomDev" AS "NomDevPrecedent"
        FROM public."VEH_BY_DEV" vb
        JOIN public."Vehid" v ON vb."GRPMOD" = v."CODE_VEH"
        JOIN public."DEV" d ON vb."IdDev" = d."IdDev"
        LEFT JOIN public."UTILISATEUR" u ON d."IdRC" = u."IdUtilisateur"
        LEFT JOIN public."ECU" e ON d."IdEcu" = e."IdEcu"
        LEFT JOIN public."FAMILLE" f ON e."IdFamille" = f."IdFamille"
        LEFT JOIN public."MAJ" m ON d."IdMaj" = m."IdMaj"
        LEFT JOIN public."ETAT_DEV" ed ON d."IdEtatDev" = ed."IdEtatDev"
        LEFT JOIN public."TYPE_DEV" td ON d."IdTypeDev" = td."IdTypeDev"
        LEFT JOIN public."DEV" dp ON d."DevPrecedent" = dp."IdDev"
        WHERE v."CODE_VEH" = :vehiculeId
        ORDER BY d."IdDev"
    """;

        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("vehiculeId", vehiculeId);

        List<Map<String, Object>> rows = jdbc.queryForList(sql, params);

        if (rows.isEmpty()) {
            return Map.of("Details", List.of());
        }

        Map<String, Object> vehicle = new LinkedHashMap<>();
        List<Map<String, Object>> devs = new ArrayList<>();

        for (Map<String, Object> row : rows) {
            if (vehicle.isEmpty()) {
                vehicle.put("CODE_VEH", row.get("CODE_VEH"));
                vehicle.put("NOMVEH", row.get("NOMVEH"));
                vehicle.put("NOMINTERNE", row.get("NOMINTERNE"));
                vehicle.put("DEVS", devs);
            }

            Map<String, Object> dev = new LinkedHashMap<>();
            dev.put("IdDev", row.get("IdDev"));
            dev.put("NomDev", row.get("NomDev"));
            dev.put("DevComment", row.get("DevComment"));
            dev.put("NomUtilisateur", row.get("NomUtilisateur"));
            dev.put("Prenom", row.get("Prenom"));
            dev.put("NomEcu", row.get("NomEcu"));
            dev.put("Nomfamille", row.get("Nomfamille"));
            dev.put("NomMaj", row.get("NomMaj"));
            dev.put("NomEtatDev", row.get("NomEtatDev"));
            dev.put("NomTypeDev", row.get("NomTypeDev"));
            dev.put("NomDevPrecedent", row.get("NomDevPrecedent"));

            devs.add(dev);
        }

        // Wrap the single vehicle in a list inside "Details"
        return Map.of("Details", List.of(vehicle));
    }




}


