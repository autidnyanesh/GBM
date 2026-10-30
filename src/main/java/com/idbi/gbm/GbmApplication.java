package com.idbi.gbm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.idbi.gbm")
public class GbmApplication {
    public static void main(String[] args) {
        SpringApplication.run(GbmApplication.class, args);
    }
}

