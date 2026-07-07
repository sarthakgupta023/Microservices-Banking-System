package com.banking.api_gateway.filter;

import java.util.List;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class JwtAuthFilter extends
        AbstractGatewayFilterFactory<JwtAuthFilter.Config> {

    private final JwtUtil jwtUtil;

    // Public paths — in pe JWT check nahi hoga
    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/validate",
            "/api/auth/health",
            "/actuator/health");

    public JwtAuthFilter(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getPath().toString();

            // Public path hai toh filter skip karo
            if (isPublicPath(path)) {
                return chain.filter(exchange);
            }

            // Authorization header check karo
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return unauthorizedResponse(exchange, "Missing Authorization header");
            }

            String authHeader = request.getHeaders()
                    .getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return unauthorizedResponse(exchange, "Invalid Authorization format");
            }

            String token = authHeader.substring(7);

            if (!jwtUtil.isTokenValid(token)) {
                return unauthorizedResponse(exchange, "Invalid or expired token");
            }

            // Token valid — user info downstream service ko bhejo (header mein)
            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractRole(token);
            String id = jwtUtil.extractId(token);

            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-User-Id", id)
                    .header("X-User-Email", email)
                    .header("X-User-Role", role)
                    .build();

            log.info("Request: {} {} | User: {}",
                    request.getMethod(), path, email);

            return chain.filter(exchange.mutate()
                    .request(modifiedRequest)
                    .build());
        };
    }

    private boolean isPublicPath(String path) {
        return PUBLIC_PATHS.stream()
                .anyMatch(path::startsWith);
    }

    private Mono<Void> unauthorizedResponse(ServerWebExchange exchange,
            String message) {
        log.warn("Unauthorized: {}", message);
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return response.setComplete();
    }

    // Config class — yml mein args define kar sakte ho
    public static class Config {
        private List<String> excludedPaths;

        public List<String> getExcludedPaths() {
            return excludedPaths;
        }

        public void setExcludedPaths(List<String> excludedPaths) {
            this.excludedPaths = excludedPaths;
        }
    }

    @Override
    public String name() {
        return "JwtAuthFilter";
    }
}
