package com.kdt.dangwalk.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "kakao")
public class KakaoProperties {
    private String restApiKey;

    public String getRestApiKey() { return restApiKey; }
    public void setRestApiKey(String restApiKey) { this.restApiKey = restApiKey; }
}
