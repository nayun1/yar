package com.yar.back.repository;

import com.yar.back.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StockRepository extends JpaRepository<Stock, String> {

    @Query("SELECT s FROM Stock s WHERE s.companyName LIKE %:name% ORDER BY " +
            "CASE WHEN s.companyName = :name THEN 0 ELSE 1 END, s.marketCap DESC")
    List<Stock> findByCompanyName(@Param("name") String name);

}
