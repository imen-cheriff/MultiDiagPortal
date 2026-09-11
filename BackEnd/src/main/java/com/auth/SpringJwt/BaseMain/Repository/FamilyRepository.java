package com.auth.SpringJwt.BaseMain.Repository;

import com.auth.SpringJwt.BaseMain.Model.Family;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FamilyRepository extends JpaRepository<Family, Long> {
    List<Family> findByCartoId(Long cartoId);
}