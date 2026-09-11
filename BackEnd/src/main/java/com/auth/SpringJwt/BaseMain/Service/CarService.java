package com.auth.SpringJwt.BaseMain.Service;

import com.auth.SpringJwt.BaseMain.Model.*;
import com.auth.SpringJwt.BaseMain.Repository.*;
import com.auth.SpringJwt.BaseMain.DTO.HistoryActionDTO;
import com.auth.SpringJwt.BaseMain.Model.HistoryAction.ActionType;
import com.auth.SpringJwt.BaseMain.Model.HistoryAction.EntityType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CarService {

    private final BrandRepository brandRepository;
    private final CarRepository carRepository;
    private final CartoRepository cartoRepository;
    private final FamilyRepository familyRepository;
    private final EcuRepository ecuRepository;
    private final HistoryService historyService;

    public CarService(
            BrandRepository brandRepository,
            CarRepository carRepository,
            CartoRepository cartoRepository,
            FamilyRepository familyRepository,
            EcuRepository ecuRepository,
            HistoryService historyService) {
        this.brandRepository = brandRepository;
        this.carRepository = carRepository;
        this.cartoRepository = cartoRepository;
        this.familyRepository = familyRepository;
        this.ecuRepository = ecuRepository;
        this.historyService = historyService;
    }

    // Helper method to get current user info
    private UserInfo getCurrentUserInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.getPrincipal() != null) {
            // Check what type the principal actually is
            Object principal = auth.getPrincipal();
            System.out.println("Principal class: " + principal.getClass().getName());

            // If using your custom User implementation
            if (principal instanceof User) {
                User userDetails = (User) principal;
                System.out.println("User found: " + userDetails.getUsername());
                return new UserInfo(userDetails.getId(), userDetails.getUsername());
            }
            // If using Spring's default UserDetails
            else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                org.springframework.security.core.userdetails.UserDetails userDetails =
                        (org.springframework.security.core.userdetails.UserDetails) principal;
                System.out.println("UserDetails found: " + userDetails.getUsername());
                // You might need to get the ID from elsewhere since default UserDetails doesn't have getId()
                return new UserInfo(getUserIdFromUsername(userDetails.getUsername()), userDetails.getUsername());
            }
            // If it's just a String (which happens in some authentication scenarios)
            else if (principal instanceof String) {
                String username = (String) principal;
                System.out.println("Username string found: " + username);

                // Handle anonymous user case specifically
                if ("anonymousUser".equals(username)) {
                    System.out.println("Anonymous user detected, using system account");
                    return new UserInfo(0, "system");
                }

                return new UserInfo(getUserIdFromUsername(username), username);
            }
        }

        // Debug information
        if (auth == null) {
            System.out.println("Authentication is null");
        } else {
            System.out.println("Authentication exists but principal is not as expected");
            System.out.println("Auth details: " + auth);
            if (auth.getPrincipal() != null) {
                System.out.println("Principal type: " + auth.getPrincipal().getClass().getName());
            }
        }

        // Default fallback if user info is not available
        System.out.println("UserInfo is null, returning default");
        return new UserInfo(0, "System");
    }

    // Helper method to get user ID from username - implement based on your data access layer
    private Integer getUserIdFromUsername(String username) {
        // This is just a placeholder - implement this based on your actual user repository
        // For example:
        // return userRepository.findByUsername(username).getId();
        return 0; // Default fallback
    }

    // Helper class to hold user info
    private static class UserInfo {
        Integer id;
        String username;

        UserInfo(Integer id, String username) {
            this.id = id;
            this.username = username;
        }
    }

    // Log action helper method with null checks
    private void logAction(ActionType actionType, EntityType entityType, Long entityId, String entityName, String details) {
        UserInfo userInfo = getCurrentUserInfo();

        // Ensure entityName is never null
        String safeEntityName = entityName != null ? entityName : "Unknown";

        // Ensure details is never null
        String safeDetails = details != null ? details : "";

        HistoryActionDTO actionDTO = new HistoryActionDTO();
        actionDTO.setActionType(actionType);
        actionDTO.setEntityType(entityType);
        actionDTO.setEntityId(entityId);
        actionDTO.setEntityName(safeEntityName); // Using safe non-null value
        actionDTO.setUserId(userInfo.id);
        actionDTO.setUserName(userInfo.username);
        actionDTO.setDetails(safeDetails); // Using safe non-null value

        try {
            historyService.logAction(actionDTO);
        } catch (Exception e) {
            System.err.println("Error logging action: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Brand operations
    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Page<Brand> getPaginatedBrands(int page, int size) {
        return brandRepository.findAll(PageRequest.of(page, size));
    }

    public Optional<Brand> getBrandById(Long id) {
        return brandRepository.findById(id);
    }

    public Optional<Brand> findBrandByName(String name) {
        return brandRepository.findByName(name);
    }

    public Brand saveBrand(Brand brand) {
        boolean isNew = brand.getId() == null;
        setupBrandRelationships(brand);
        Brand savedBrand = brandRepository.save(brand);

        // Log action with null checks
        String brandName = savedBrand.getName() != null ? savedBrand.getName() : "Unknown Brand";
        if (isNew) {
            logAction(ActionType.add, EntityType.carto, savedBrand.getId(), brandName,
                    "Added new brand: " + brandName);
        } else {
            logAction(ActionType.modify, EntityType.carto, savedBrand.getId(), brandName,
                    "Updated brand: " + brandName);
        }

        return savedBrand;
    }

    public void deleteBrand(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Brand ID cannot be null");
        }

        Optional<Brand> brandOpt = brandRepository.findById(id);
        if (brandOpt.isPresent()) {
            Brand brand = brandOpt.get();
            String brandName = brand.getName() != null ? brand.getName() : "Unknown Brand";
            brandRepository.deleteById(id);

            // Log action
            logAction(ActionType.delete, EntityType.carto, id, brandName,
                    "Deleted brand: " + brandName);
        } else {
            brandRepository.deleteById(id);
        }
    }

    // Car operations
    public List<Car> getAllCars() {
        return carRepository.findAll();
    }

    public List<Car> getCarsByBrandId(Long brandId) {
        return carRepository.findByBrandId(brandId);
    }

    public Optional<Car> findCarByModel(String model) {
        return carRepository.findByModel(model);
    }

    public Optional<Car> getCarById(Long id) {
        return carRepository.findById(id);
    }

    public Car saveCar(Car car) {
        boolean isNew = car.getId() == null;
        setupCarRelationships(car);
        Car savedCar = carRepository.save(car);

        // Add history logging for Car entities with car.model as entityName
        String carModel = savedCar.getModel() != null ? savedCar.getModel() : "Unknown Car";
        if (isNew) {
            logAction(ActionType.add, EntityType.carto, savedCar.getId(), carModel,
                    "Added new car: " + carModel);
        } else {
            logAction(ActionType.modify, EntityType.carto, savedCar.getId(), carModel,
                    "Updated car: " + carModel);
        }

        return savedCar;
    }

    public void deleteCar(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Car ID cannot be null");
        }

        Optional<Car> carOpt = carRepository.findById(id);
        if (carOpt.isPresent()) {
            Car car = carOpt.get();
            String carModel = car.getModel() != null ? car.getModel() : "Unknown Car";
            carRepository.deleteById(id);

            // Add history logging for car deletion
            logAction(ActionType.delete, EntityType.carto, id, carModel,
                    "Deleted car: " + carModel);
        } else {
            carRepository.deleteById(id);
        }
    }

    // Carto operations
    public List<Carto> getAllCartos() {
        return cartoRepository.findAll();
    }

    public List<Carto> getCartosByCarId(Long carId) {
        return cartoRepository.findByCarId(carId);
    }

    public Optional<Carto> getCartoById(Long id) {
        return cartoRepository.findById(id);
    }

    public Carto saveCarto(Carto carto) {
        boolean isNew = carto.getId() == null;

        // Set default status for new cartos
        if (isNew) {
            carto.setStatus(CartoStatus.PENDING);
        }

        setupCartoRelationships(carto);
        Carto savedCarto = cartoRepository.save(carto);
        return savedCarto;
    }

    public List<Carto> getPendingCartos() {
        return cartoRepository.findByStatus(CartoStatus.PENDING);
    }

    @Transactional
    public Carto updateCartoStatus(Long cartoId, CartoStatus newStatus) throws Exception {
        Carto carto = cartoRepository.findById(cartoId)
                .orElseThrow(() -> new Exception("Carto not found with id " + cartoId));

        // Update status
        carto.setStatus(newStatus);
        Carto updatedCarto = cartoRepository.save(carto);

        // Determine action type and description
        ActionType actionType;
        String description;

        if (newStatus == CartoStatus.APPROVED) {
            actionType = ActionType.approve;
            description = "Cartography approved";
        } else if (newStatus == CartoStatus.REJECTED) {
            actionType = ActionType.reject;
            description = "Cartography rejected";
        } else {
            throw new IllegalArgumentException("Invalid carto status: " + newStatus);
        }

        // Log action history
        // logAction(actionType, EntityType.carto, cartoId, carto.getName(), description);

        return updatedCarto;
    }

    public long countPendingCartos() {
        return cartoRepository.countByStatus(CartoStatus.PENDING);
    }


    public void deleteCarto(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Carto ID cannot be null");
        }
        Optional<Carto> cartoOpt = cartoRepository.findById(id);
        if (cartoOpt.isPresent()) {
            Carto carto = cartoOpt.get();
            String cartoName = carto.getName() != null ? carto.getName() : "Unknown Cartography";
            cartoRepository.deleteById(id);

            // Log action
//            logAction(ActionType.delete, EntityType.carto, id, cartoName,
//                    "Deleted cartography: " + cartoName);
        } else {
            cartoRepository.deleteById(id);
        }
    }

    // Family operations
    public List<Family> getAllFamilies() {
        return familyRepository.findAll();
    }

    public List<Family> getFamiliesByCartoId(Long cartoId) {
        return familyRepository.findByCartoId(cartoId);
    }

    public Optional<Family> getFamilyById(Long id) {
        return familyRepository.findById(id);
    }

    public Family saveFamily(Family family) {
        boolean isNew = family.getId() == null;
        Family savedFamily = familyRepository.save(family);

        // Log action with null checks
        String familyName = savedFamily.getName() != null ? savedFamily.getName() : "Unknown Family";
        if (isNew) {
            logAction(ActionType.add, EntityType.family, savedFamily.getId(), familyName,
                    "Added new family: " + familyName);
        } else {
            logAction(ActionType.modify, EntityType.family, savedFamily.getId(), familyName,
                    "Updated family: " + familyName);
        }

        return savedFamily;
    }

    public void deleteFamily(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Family ID cannot be null");
        }

        Optional<Family> familyOpt = familyRepository.findById(id);
        if (familyOpt.isPresent()) {
            Family family = familyOpt.get();
            String familyName = family.getName() != null ? family.getName() : "Unknown Family";
            familyRepository.deleteById(id);

            // Log action
            logAction(ActionType.delete, EntityType.family, id, familyName,
                    "Deleted family: " + familyName);
        } else {
            familyRepository.deleteById(id);
        }
    }

    // ECU operations
    public List<Ecu> getAllEcus() {
        return ecuRepository.findAll();
    }

    public List<Ecu> getEcusByFamilyId(Long familyId) {
        return ecuRepository.findByFamilyId(familyId);
    }

    public Optional<Ecu> getEcuById(Integer id) {
        return ecuRepository.findById(id);
    }

    public Ecu saveEcu(Ecu ecu) {
        boolean isNew = ecu.getId() == null;
        Ecu savedEcu = ecuRepository.save(ecu);

        // Log action with null checks
        String ecuName = savedEcu.getName() != null ? savedEcu.getName() : "Unknown ECU";
        if (isNew) {
            logAction(ActionType.add, EntityType.ecu, savedEcu.getId().longValue(), ecuName,
                    "Added new ECU: " + ecuName);
        } else {
            logAction(ActionType.modify, EntityType.ecu, savedEcu.getId().longValue(), ecuName,
                    "Updated ECU: " + ecuName);
        }

        return savedEcu;
    }

    public void deleteEcu(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("ECU ID cannot be null");
        }

        Optional<Ecu> ecuOpt = ecuRepository.findById(id);
        if (ecuOpt.isPresent()) {
            Ecu ecu = ecuOpt.get();
            String ecuName = ecu.getName() != null ? ecu.getName() : "Unknown ECU";
            ecuRepository.deleteById(id);

            // Log action
            logAction(ActionType.delete, EntityType.ecu, id.longValue(), ecuName,
                    "Deleted ECU: " + ecuName);
        } else {
            ecuRepository.deleteById(id);
        }
    }

    // Helper methods for relationship setup
    private void setupBrandRelationships(Brand brand) {
        if (brand.getCars() != null) {
            for (Car car : brand.getCars()) {
                car.setBrand(brand);
                setupCarRelationships(car);
            }
        }
    }

    private void setupCarRelationships(Car car) {
        if (car.getCartos() != null) {
            for (Carto carto : car.getCartos()) {
                carto.setCar(car);
                setupCartoRelationships(carto);
            }
        }
    }

    private void setupCartoRelationships(Carto carto) {
        if (carto.getFamilies() != null) {
            for (Family family : carto.getFamilies()) {
                family.setCarto(carto);
                setupFamilyRelationships(family);
            }
        }
    }

    private void setupFamilyRelationships(Family family) {
        if (family.getEcus() != null) {
            for (Ecu ecu : family.getEcus()) {
                ecu.setFamily(family);
            }
        }
    }
}