package com.kdt.dangwalk.backend.service;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.kdt.dangwalk.backend.entity.UserEntity;
import com.kdt.dangwalk.backend.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByUserid(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        String role = user.getRole() == null || user.getRole().isBlank() ? "USER" : user.getRole();

        return User.withUsername(user.getUserid())
                .password(user.getPassword())
                .authorities(new SimpleGrantedAuthority("ROLE_" + role))
                .build();
    }
}
