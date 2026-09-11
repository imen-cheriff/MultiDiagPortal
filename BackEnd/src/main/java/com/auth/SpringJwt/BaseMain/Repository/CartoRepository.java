package com.auth.SpringJwt.BaseMain.Repository;

import com.auth.SpringJwt.BaseMain.Model.Carto;
import com.auth.SpringJwt.BaseMain.Model.CartoStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartoRepository extends JpaRepository<Carto, Long> {
    List<Carto> findByCarId(Long carId);
    List<Carto> findByStatus(CartoStatus status);

    long countByStatus(CartoStatus status);
}
