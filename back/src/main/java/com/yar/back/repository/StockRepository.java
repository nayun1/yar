package com.yar.back.repository;

import com.yar.back.entity.Stock;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, String> {

    // 종목 검색 - 회사명으로 검색 (대소문자 무시, LIKE 검색)
    @Query("SELECT s FROM Stock s WHERE LOWER(s.companyName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Stock> findByCompanyNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);

    // 종목코드로 정확한 종목 조회
    Optional<Stock> findByStockCode(String stockCode);
}
