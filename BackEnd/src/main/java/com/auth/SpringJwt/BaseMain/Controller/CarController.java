package com.auth.SpringJwt.BaseMain.Controller;

import com.auth.SpringJwt.BaseMain.Model.*;
import com.auth.SpringJwt.BaseMain.Service.CarService;
import com.auth.SpringJwt.BaseMain.Service.HistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequestMapping("/api/workspace")
@Transactional
public class CarController {

    private final CarService carService;
    private final HistoryService historyService;

    @Autowired
    public CarController(CarService carService, HistoryService historyService) {
        this.carService = carService;
        this.historyService = historyService;
    }

    // Brand endpoints
    @GetMapping("/brands")
    public ResponseEntity<List<Brand>> getAllBrands() {
        List<Brand> brands = carService.getAllBrands();
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/brands/paginated")
    public ResponseEntity<?> getPaginatedBrands(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        if (page < 0 || size <= 0) {
            return ResponseEntity.badRequest().body("Invalid pagination parameters.");
        }

        Page<Brand> brandPage = carService.getPaginatedBrands(page, size);
        return ResponseEntity.ok(brandPage);
    }

    @GetMapping("/brands/{id}")
    public ResponseEntity<Brand> getBrandById(@PathVariable Long id) {
        Optional<Brand> brand = carService.getBrandById(id);
        return brand.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/brands")
    public ResponseEntity<?> createBrand(@RequestBody Brand brand) {
        // Check if the brand name already exists
        Optional<Brand> existingBrand = carService.findBrandByName(brand.getName());
        if (existingBrand.isPresent()) {
            // Return a response indicating the brand already exists
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Brand already exists");
        }

        // Save the new brand if it doesn't exist
        Brand savedBrand = carService.saveBrand(brand);
        return ResponseEntity.ok(savedBrand);
    }


    @PutMapping("/brands/{id}")
    public ResponseEntity<Brand> updateBrand(@PathVariable Long id, @RequestBody Brand updatedBrand) {
        Optional<Brand> existingBrandOptional = carService.getBrandById(id);

        if (existingBrandOptional.isPresent()) {
            Brand existingBrand = existingBrandOptional.get();
            existingBrand.setName(updatedBrand.getName());

            // Clear existing relationships and set the new ones
            existingBrand.getCars().clear();
            if (updatedBrand.getCars() != null) {
                for (Car car : updatedBrand.getCars()) {
                    car.setBrand(existingBrand);
                    existingBrand.getCars().add(car);
                }
            }

            Brand savedBrand = carService.saveBrand(existingBrand);
            return ResponseEntity.ok(savedBrand);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/brands/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        Optional<Brand> brand = carService.getBrandById(id);
        if (brand.isPresent()) {
            carService.deleteBrand(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Car endpoints
    @GetMapping("/cars")
    public ResponseEntity<List<Car>> getAllCars() {
        List<Car> cars = carService.getAllCars();
        return ResponseEntity.ok(cars);
    }

    @GetMapping("/brands/{brandId}/cars")
    public ResponseEntity<List<Car>> getCarsByBrandId(@PathVariable Long brandId) {
        List<Car> cars = carService.getCarsByBrandId(brandId);
        return ResponseEntity.ok(cars);
    }

    @GetMapping("/cars/{id}")
    public ResponseEntity<Car> getCarById(@PathVariable Long id) {
        Optional<Car> car = carService.getCarById(id);
        return car.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/brands/{brandId}/cars")
    public ResponseEntity<?> createCar(@PathVariable Long brandId, @RequestBody Car car) {
        // Retrieve the Brand object using the brandId
        Optional<Brand> optionalBrand = carService.getBrandById(brandId);

        if (!optionalBrand.isPresent()) {
            return ResponseEntity.badRequest().body("Invalid brand ID: " + brandId);
        }

        // Check if the car model already exists for the given brand
        Optional<Car> existingCar = carService.findCarByModel(car.getModel());
        if (existingCar.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Car model already exists for this brand.");
        }

        // Set the Brand object in Car
        car.setBrand(optionalBrand.get());

        // Save the Car object in the database
        Car savedCar = carService.saveCar(car);

        // Return the saved car object in the response
        return ResponseEntity.ok(savedCar);
    }


    @PutMapping("/cars/{id}")
    public ResponseEntity<Car> updateCar(@PathVariable Long id, @RequestBody Car updatedCar) {
        Optional<Car> existingCarOptional = carService.getCarById(id);

        if (existingCarOptional.isPresent()) {
            Car existingCar = existingCarOptional.get();

            // Update basic fields
            existingCar.setModel(updatedCar.getModel());
            existingCar.setYear(updatedCar.getYear());

            // Clear existing relationships and set the new ones
            existingCar.getCartos().clear();
            if (updatedCar.getCartos() != null) {
                for (Carto carto : updatedCar.getCartos()) {
                    carto.setCar(existingCar);
                    existingCar.getCartos().add(carto);
                }
            }

            Car savedCar = carService.saveCar(existingCar);
            return ResponseEntity.ok(savedCar);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/cars/{id}")
    public ResponseEntity<Void> deleteCar(@PathVariable Long id) {
        Optional<Car> car = carService.getCarById(id);
        if (car.isPresent()) {
            carService.deleteCar(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Carto endpoints
    @GetMapping("/cartos")
    public ResponseEntity<List<Carto>> getAllCartos() {
        List<Carto> cartos = carService.getAllCartos();
        return ResponseEntity.ok(cartos);
    }

    @GetMapping("/cars/{carId}/cartos")
    public ResponseEntity<List<Carto>> getCartosByCarId(@PathVariable Long carId) {
        List<Carto> cartos = carService.getCartosByCarId(carId);
        return ResponseEntity.ok(cartos);
    }

    @GetMapping("/cartos/{id}")
    public ResponseEntity<Carto> getCartoById(@PathVariable Long id) {
        Optional<Carto> carto = carService.getCartoById(id);
        return carto.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/cars/{carId}/cartos")
    public ResponseEntity<?> createCarto(@PathVariable Long carId, @RequestBody Carto carto) {
        // Retrieve Car object safely using the carId from the URL
        Optional<Car> optionalCar = carService.getCarById(carId);

        Car car;
        // Check if Car exists
        if (!optionalCar.isPresent()) {
            // Create a brand with that id and name
            Brand brand = new Brand();
            brand.setId(carId); // Using carId for brand (as per requirement)
            brand.setName("Brand-" + carId); // Setting a default brand name based on ID
            Brand savedBrand = carService.saveBrand(brand);


            // Create a car with that id and model
            car = new Car();
            car.setId(carId);
            car.setModel("Model-" + carId); // Setting a default car model based on ID
            car.setBrand(savedBrand);
            car = carService.saveCar(car);
        } else {
            car = optionalCar.get();
        }

        // Set the actual Car object in Carto
        carto.setCar(car);
        // Set creation date automatically
        carto.setCreationDate(LocalDateTime.now());

        // Save Carto in database
        Carto savedCarto = carService.saveCarto(carto);

        // Build a response object that includes carId and the saved carto
        Map<String, Object> response = new HashMap<>();
        response.put("carId", carId);
        response.put("carto", savedCarto);

        return ResponseEntity.ok(response);
    }


    @PutMapping("/cartos/{id}")
    public ResponseEntity<Carto> updateCarto(@PathVariable Long id, @RequestBody Carto updatedCarto) {
        Optional<Carto> existingCartoOptional = carService.getCartoById(id);

        if (existingCartoOptional.isPresent()) {
            Carto existingCarto = existingCartoOptional.get();

            // Update basic fields
            existingCarto.setName(updatedCarto.getName());
            existingCarto.setOutil(updatedCarto.getOutil());
            existingCarto.setVersion(updatedCarto.getVersion());


            // Clear existing relationships and set the new ones
            existingCarto.getFamilies().clear();
            if (updatedCarto.getFamilies() != null) {
                for (Family family : updatedCarto.getFamilies()) {
                    family.setCarto(existingCarto);
                    existingCarto.getFamilies().add(family);
                }
            }

            Carto savedCarto = carService.saveCarto(existingCarto);
            return ResponseEntity.ok(savedCarto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/cartos/{id}")
    public ResponseEntity<Void> deleteCarto(@PathVariable Long id) {
        Optional<Carto> carto = carService.getCartoById(id);
        if (carto.isPresent()) {
            carService.deleteCarto(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Family endpoints
    @GetMapping("/families")
    public ResponseEntity<List<Family>> getAllFamilies() {
        List<Family> families = carService.getAllFamilies();
        return ResponseEntity.ok(families);
    }

    @GetMapping("/cartos/{cartoId}/families")
    public ResponseEntity<List<Family>> getFamiliesByCartoId(@PathVariable Long cartoId) {
        List<Family> families = carService.getFamiliesByCartoId(cartoId);
        return ResponseEntity.ok(families);
    }

    @GetMapping("/families/{id}")
    public ResponseEntity<Family> getFamilyById(@PathVariable Long id) {
        Optional<Family> family = carService.getFamilyById(id);
        return family.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/cartos/{cartoId}/families")
    public ResponseEntity<Family> createFamily(@PathVariable Long cartoId, @RequestBody Family family) {
        Family savedFamily = carService.saveFamily(family);
        return ResponseEntity.ok(savedFamily);
    }

    @PutMapping("/families/{id}")
    public ResponseEntity<Family> updateFamily(@PathVariable Long id, @RequestBody Family updatedFamily) {
        Optional<Family> existingFamilyOptional = carService.getFamilyById(id);

        if (existingFamilyOptional.isPresent()) {
            Family existingFamily = existingFamilyOptional.get();

            // Update basic fields
            existingFamily.setName(updatedFamily.getName());


            // Clear existing relationships and set the new ones
            existingFamily.getEcus().clear();
            if (updatedFamily.getEcus() != null) {
                for (Ecu ecu : updatedFamily.getEcus()) {
                    ecu.setFamily(existingFamily);
                    existingFamily.getEcus().add(ecu);
                }
            }

            Family savedFamily = carService.saveFamily(existingFamily);
            return ResponseEntity.ok(savedFamily);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/families/{id}")
    public ResponseEntity<Void> deleteFamily(@PathVariable Long id) {
        Optional<Family> family = carService.getFamilyById(id);
        if (family.isPresent()) {
            carService.deleteFamily(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ECU endpoints
    @GetMapping("/ecus")
    public ResponseEntity<List<Ecu>> getAllEcus() {
        List<Ecu> ecus = carService.getAllEcus();
        return ResponseEntity.ok(ecus);
    }

    @GetMapping("/families/{familyId}/ecus")
    public ResponseEntity<List<Ecu>> getEcusByFamilyId(@PathVariable Long familyId) {
        List<Ecu> ecus = carService.getEcusByFamilyId(familyId);
        return ResponseEntity.ok(ecus);
    }

    @GetMapping("/ecus/{id}")
    public ResponseEntity<Ecu> getEcuById(@PathVariable Integer id) {
        Optional<Ecu> ecu = carService.getEcuById(id);
        return ecu.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/ecus")
    public ResponseEntity<Ecu> createEcu(@RequestBody Ecu ecu) {
        Ecu savedEcu = carService.saveEcu(ecu);
        return ResponseEntity.ok(savedEcu);
    }

    @PutMapping("/ecus/{id}")
    public ResponseEntity<Ecu> updateEcu(@PathVariable Integer id, @RequestBody Ecu updatedEcu) {
        Optional<Ecu> existingEcuOptional = carService.getEcuById(id);

        if (existingEcuOptional.isPresent()) {
            Ecu existingEcu = existingEcuOptional.get();

            // Update all fields
            existingEcu.setMotorisation(updatedEcu.getMotorisation());
            existingEcu.setType(updatedEcu.getType());
            existingEcu.setName(updatedEcu.getName());
            existingEcu.setPerimetre(updatedEcu.getPerimetre());
            existingEcu.setReco(updatedEcu.getReco());
            existingEcu.setMpm(updatedEcu.getMpm());
            existingEcu.setIdent(updatedEcu.getIdent());
            existingEcu.setTa(updatedEcu.getTa());
            existingEcu.setFa(updatedEcu.getFa());
            existingEcu.setProtocol(updatedEcu.getProtocol());
            existingEcu.setAddress(updatedEcu.getAddress());
            existingEcu.setPIN(updatedEcu.getPIN());
            existingEcu.setSa(updatedEcu.getSa());
            existingEcu.setRespDev(updatedEcu.getRespDev());
            existingEcu.setEtatDev(updatedEcu.getEtatDev());
            existingEcu.setTypeDev(updatedEcu.getTypeDev());
            existingEcu.setObjectifCible(updatedEcu.getObjectifCible());
            existingEcu.setmdsd(updatedEcu.getmdsd());
            existingEcu.setCibleLivraison(updatedEcu.getCibleLivraison());
            existingEcu.setComparaisonEntre(updatedEcu.getComparaisonEntre());
            existingEcu.setEstimationChiffrage(updatedEcu.getEstimationChiffrage());

            Ecu savedEcu = carService.saveEcu(existingEcu);
            return ResponseEntity.ok(savedEcu);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/ecus/{id}")
    public ResponseEntity<Void> deleteEcu(@PathVariable Integer id) {
        Optional<Ecu> ecu = carService.getEcuById(id);
        if (ecu.isPresent()) {
            carService.deleteEcu(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/verify-cartos")
    public ResponseEntity<List<Carto>> getPendingCartos() {
        List<Carto> pendingCartos = carService.getPendingCartos();
        return ResponseEntity.ok(pendingCartos);
    }

    @PutMapping("/verify-cartos/cartos/{cartoId}/approve")
    public ResponseEntity<?> approveCarto(@PathVariable Long cartoId) throws Exception {
        Carto approvedCarto = carService.updateCartoStatus(cartoId, CartoStatus.APPROVED);
        return ResponseEntity.ok(approvedCarto);
    }

    @PutMapping("/verify-cartos/cartos/{cartoId}/reject")
    public ResponseEntity<?> rejectCarto(@PathVariable Long cartoId) throws Exception {
        Carto rejectedCarto = carService.updateCartoStatus(cartoId, CartoStatus.REJECTED);
        return ResponseEntity.ok(rejectedCarto);
    }

    @GetMapping("/verify-cartos/count")
    public ResponseEntity<Long> countPendingCartos() {
        long count = carService.countPendingCartos();
        return ResponseEntity.ok(count);
    }

}