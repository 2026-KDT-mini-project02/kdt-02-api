package com.kdt.dangwalk.backend.controller;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kdt.dangwalk.backend.dto.PhotoSpotDto;
import com.kdt.dangwalk.backend.entity.PhotoSpotEntity;
import com.kdt.dangwalk.backend.entity.UserEntity;
import com.kdt.dangwalk.backend.repository.PhotoSpotRepository;
import com.kdt.dangwalk.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/photo-spots")
public class PhotoSpotController {

    private static final long MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024L;
    private static final String PHOTO_SPOT_DIR = "photo-spots";

    private final PhotoSpotRepository photoSpotRepository;
    private final UserRepository userRepository;
    private final Path uploadDir;

    public PhotoSpotController(
            PhotoSpotRepository photoSpotRepository,
            UserRepository userRepository,
            @Value("${app.upload.base-dir:uploads}") String uploadBaseDir
    ) {
        this.photoSpotRepository = photoSpotRepository;
        this.userRepository = userRepository;
        this.uploadDir = Path.of(uploadBaseDir, PHOTO_SPOT_DIR).toAbsolutePath().normalize();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("lat") Double lat,
            @RequestParam("lng") Double lng,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }

        if (lat == null || lng == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "lat/lng are required"));
        }

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Image file is required"));
        }

        if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
            return ResponseEntity.badRequest().body(Map.of("message", "Image size must be <= 10MB"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only image files are allowed"));
        }

        String userid = authentication.getName();
        UserEntity user = userRepository.findByUserid(userid).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        String extension = resolveExtension(file.getOriginalFilename(), contentType);
        String storedFileName = UUID.randomUUID().toString().replace("-", "") + extension;
        Path targetPath = uploadDir.resolve(storedFileName);

        try {
            Files.createDirectories(uploadDir);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to store image file"));
        }

        PhotoSpotEntity entity = new PhotoSpotEntity();
        entity.setUser(user);
        entity.setLat(lat);
        entity.setLng(lng);
        entity.setFileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : storedFileName);
        entity.setContentType(contentType);
        entity.setImageUrl("/uploads/photo-spots/" + storedFileName);

        PhotoSpotEntity saved = photoSpotRepository.save(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(PhotoSpotDto.from(saved));
    }

    @GetMapping("/mine")
    public ResponseEntity<?> mine(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }

        String userid = authentication.getName();
        List<PhotoSpotDto> result = photoSpotRepository.findByUser_UseridOrderByCreatedAtDesc(userid)
                .stream()
                .map(PhotoSpotDto::from)
                .toList();

        return ResponseEntity.ok(result);
    }

    private String resolveExtension(String originalFilename, String contentType) {
        if (originalFilename != null) {
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex >= 0 && dotIndex < originalFilename.length() - 1) {
                String ext = originalFilename.substring(dotIndex).toLowerCase();
                if (ext.matches("\\.[a-z0-9]{1,10}")) {
                    return ext;
                }
            }
        }

        return switch (contentType.toLowerCase()) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            default -> ".img";
        };
    }
}

