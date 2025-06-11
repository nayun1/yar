package com.yar.back.repository;

import com.yar.back.entity.Stock;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, String> {

    // 메인 검색 메서드 - 올바른 로직
    @Query("SELECT s FROM Stock s WHERE s.companyName LIKE CONCAT('%', :name, '%') ORDER BY " +
            "CASE WHEN s.companyName = :name THEN 0 " +                          // 완전일치 (삼성전자)
            "WHEN s.companyName LIKE CONCAT(:name, '%') THEN 1 " +               // 시작문자 일치 (삼성XXX)
            "ELSE 2 END, " +                                                     // 나머지 부분일치 (XXX삼성XXX)
            "s.marketCap DESC")
    List<Stock> findByCompanyName(@Param("name") String name);

    // 종목코드로 정확히 찾기 (상세 페이지용)
    Optional<Stock> findByStockCode(String stockCode);

    // 시가총액 상위 종목들 (메인 페이지용)
    @Query("SELECT s FROM Stock s ORDER BY s.marketCap DESC")
    List<Stock> findTopStocksByMarketCap(Pageable pageable);

    // 시장구분별 검색 (시가총액 순)
    @Query("SELECT s FROM Stock s WHERE s.marketType = :marketType ORDER BY s.marketCap DESC")
    List<Stock> findByMarketType(@Param("marketType") String marketType, Pageable pageable);

    // 검색 결과 개수 조회
    @Query("SELECT COUNT(s) FROM Stock s WHERE s.companyName LIKE CONCAT('%', :keyword, '%')")
    long countByKeyword(@Param("keyword") String keyword);
}
