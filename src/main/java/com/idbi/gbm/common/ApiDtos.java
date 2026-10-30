package com.idbi.gbm.common;

import java.time.Instant;
import java.util.Map;

public final class ApiDtos {
    private ApiDtos() {}

    public record ErrorResponse(String code, String message, Instant timestamp, Map<String, String> fieldErrors) {}
}



