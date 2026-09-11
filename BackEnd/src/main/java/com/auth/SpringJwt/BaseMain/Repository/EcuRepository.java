package com.auth.SpringJwt.BaseMain.Repository;

import com.auth.SpringJwt.BaseMain.Model.Ecu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EcuRepository extends JpaRepository<Ecu, Integer> {
    List<Ecu> findByFamilyId(Long familyId);
}