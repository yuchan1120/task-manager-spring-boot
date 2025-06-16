package com.example.taskmanager.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Collections;
import java.util.Enumeration;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // リクエストをキャッシュ可能にラップ
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);

        // フィルター処理を継続
        filterChain.doFilter(wrappedRequest, response);

        // ログ出力
        logRequestDetails(wrappedRequest);
    }

    private void logRequestDetails(ContentCachingRequestWrapper request) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String query = request.getQueryString();
        String clientIp = request.getRemoteAddr();

        logger.info("📥 Request received: method={}, uri={}, query={}, clientIp={}", method, uri, query, clientIp);

        // ヘッダー出力（必要に応じてマスキング）
        Enumeration<String> headerNames = request.getHeaderNames();
        if (headerNames != null) {
            Collections.list(headerNames).forEach(headerName -> {
                String value = request.getHeader(headerName);
                if ("authorization".equalsIgnoreCase(headerName)) {
                    value = "****"; // マスキング
                }
                logger.debug("🔑 Header: {} = {}", headerName, value);
            });
        }

        // リクエストボディ出力（最大長に注意）
        byte[] buf = request.getContentAsByteArray();
        if (buf.length > 0) {
            try {
                String body = new String(buf, 0, buf.length, request.getCharacterEncoding());
                logger.debug("📝 Request Body: {}", body);
            } catch (UnsupportedEncodingException e) {
                logger.warn("⚠️ Unsupported encoding: {}", request.getCharacterEncoding(), e);
            }
        }
    }
}
