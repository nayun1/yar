# Yar 백엔드 프로젝트

[![Java](https://img.shields.io/badge/Java-17-blue.svg)](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Gradle](https://img.shields.io/badge/Gradle-8.x-yellow.svg)](https://gradle.org/)

## 📝 프로젝트 소개
**Yar 애플리케이션의 핵심 비즈니스 로직을 처리하는 백엔드 서버입니다.**

본 프로젝트는 Spring Boot를 기반으로 구축되었으며, **한국투자증권(KIS) API**를 연동하여 실시간 주식 시세, 계좌 정보 조회, 주문 실행 등의 금융 서비스를 제공합니다. RESTful API를 통해 클라이언트(웹/앱)와 통신하며, 안정적이고 확장 가능한 아키텍처를 지향합니다.

---

## 🛠️ 주요 기술 스택

| 구분 | 기술 | 설명 |
| --- | --- | --- |
| **언어** | Java 17 | 안정성과 풍부한 생태계를 자랑하는 주력 개발 언어 |
| **프레임워크** | Spring Boot 3.5.0 | MSA(Microservice Architecture)에 최적화된 백엔드 프레임워크 |
| **주요 모듈** | Spring Web, Spring Data JPA | REST API 개발 및 ORM(Object-Relational Mapping)을 위함 |
| **빌드 도구** | Gradle | 의존성 관리 및 프로젝트 빌드 자동화 |
| **데이터베이스**| MySQL | 관계형 데이터베이스 관리 시스템 (RDBMS) |
| **ORM**| Hibernate/JPA | 객체 지향 패러다임과 관계형 데이터베이스의 불일치 해소 |
| **로깅** | Logback | SLF4J 구현체로, 강력하고 유연한 로깅 시스템 제공 |
| **테스트** | JUnit 5, Mockito | 단위 테스트 및 Mock 객체 생성을 통한 견고한 코드 품질 유지 |

---

## 🔗 외부 API 연동: 한국투자증권 (KIS API)

본 프로젝트는 한국투자증권에서 제공하는 Open API를 사용하여 금융 데이터를 처리합니다.

- **주요 기능**:
  - **실시간/현재 주식 시세 조회**: 국내 주식의 가격 정보를 API를 통해 가져옵니다.
  - **계좌 잔고 및 정보 조회**: 사용자의 계좌 정보를 안전하게 조회합니다.
  - **주식 주문 (매수/매도)**: API를 통해 주식 거래 주문을 실행합니다.

- **인증 방식**:
  - API 사용을 위해 `APP KEY`와 `APP SECRET`을 발급받아 OAuth2.0 기반의 **접근 토큰(Access Token)**을 생성합니다.
  - 생성된 토큰은 API 요청 시 `Authorization` 헤더에 담아 전송하여 인증을 처리합니다.
  - 토큰의 유효기간을 관리하고 필요 시 재발급하는 로직이 포함되어 있습니다.

- **모듈**:
  - `KISApiService` (가칭): KIS API와의 모든 통신을 전담하는 서비스 모듈입니다. API 요청/응답 처리, 토큰 관리, 예외 처리 등의 역할을 수행합니다.

---

## ⚙️ 실행 방법

### 1. 사전 요구사항
- Java Development Kit (JDK) 17 이상 설치
- Gradle 8.x 이상 설치
- MySQL 서버 실행 및 데이터베이스 생성
- **한국투자증권 API APP KEY, SECRET 발급** ([공식 가이드](https://apiportal.koreainvestment.com/))

### 2. 프로젝트 클론 및 설정
```bash
# 1. 프로젝트를 복제합니다.
git clone https://github.com/your-username/yar.git

# 2. 백엔드 디렉토리로 이동합니다.
cd yar/back
```

### 3. 환경 변수 설정
`src/main/resources/application.properties` 파일을 열어 본인의 환경에 맞게 아래 정보를 수정합니다.

```properties
# =======================================
# Database (MySQL)
# =======================================
spring.datasource.url=jdbc:mysql://localhost:3306/yar_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=db_username
spring.datasource.password=db_password

# JPA & Hibernate
spring.jpa.hibernate.ddl-auto=update # 개발 초기에는 update/create, 운영에서는 validate/none 권장
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# =======================================
# Korea Investment & Securities API
# =======================================
kis.api.app-key=YOUR_APP_KEY
kis.api.app-secret=YOUR_APP_SECRET
kis.api.base-url=https://openapivts.koreainvestment.com:29443 # 모의투자 환경
# kis.api.base-url=https://openapi.koreainvestment.com:9443 # 실전투자 환경
```
**※ 보안 주의**: 실제 `APP_KEY`와 `APP_SECRET`은 Git에 커밋하지 않고, 환경 변수나 Spring Cloud Config 등을 통해 외부에서 주입하는 것을 강력히 권장합니다.

### 4. 프로젝트 빌드 및 실행
```bash
# 1. (Windows) Gradle Wrapper를 사용하여 프로젝트를 빌드합니다.
./gradlew.bat build

# 2. 애플리케이션을 실행합니다.
./gradlew.bat bootRun
```
애플리케이션이 성공적으로 실행되면, 기본적으로 `http://localhost:8080` 에서 서버가 시작됩니다.

---

## 📂 프로젝트 구조
```
back/
├── src/
│   ├── main/
│   │   ├── java/com/yar/         # ☕ 자바 소스 코드
│   │   │   ├── controller/       # API 엔드포인트 및 요청/응답 처리
│   │   │   ├── service/          # 핵심 비즈니스 로직 (KIS API 연동 로직 포함)
│   │   │   ├── repository/       # 데이터베이스 접근 (JPA Repository)
│   │   │   ├── entity/           # 데이터베이스 테이블과 매핑되는 객체
│   │   │   └── dto/              # 데이터 전송 객체 (Request/Response)
│   │   │
│   │   └── resources/            # 🏞️ 정적 리소스 및 설정 파일
│   │       └── application.properties # Spring Boot 핵심 설정
│   │
│   └── test/                     # 🧪 테스트 코드
│
├── build.gradle                  # 📜 Gradle 빌드 스크립트
└── README.md                     # 📖 프로젝트 안내서
```

---

## 🌐 API 엔드포인트 명세
주요 API 엔드포인트는 아래와 같습니다.

| Method | URL | 설명 |
| --- | --- | --- |
| `GET` | `/api/stocks/price/{stockCode}` | (KIS) 특정 종목의 현재가를 조회합니다. |
| `GET` | `/api/account/balance` | (KIS) 계좌 잔고를 조회합니다. |
| `POST`| `/api/orders/buy` | (KIS) 매수 주문을 실행합니다. |
|`POST`|`/api/orders/sell`| (KIS) 매도 주문을 실행합니다. |

---

## 🖼️ 스크린샷 또는 아키텍처 다이어그램

### 시스템 아키텍처
![Architecture Diagram](https://via.placeholder.com/800x400.png?text=System+Architecture+Diagram)
*(여기에 시스템 아키텍처 다이어그램 이미지를 추가하세요.)*

### ERD (Entity-Relationship Diagram)
![Database ERD](https.via.placeholder.com/800x400.png?text=Database+ERD)
*(여기에 데이터베이스 관계도 이미지를 추가하세요.)*
