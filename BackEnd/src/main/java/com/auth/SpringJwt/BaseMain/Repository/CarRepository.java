package com.auth.SpringJwt.BaseMain.Repository;

import com.auth.SpringJwt.BaseMain.Model.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {
    //    List<Car> findByBrandName(String brandName);
    List<Car> findByBrandId(Long brandId);

    Optional<Car> findByModel(String model);
}