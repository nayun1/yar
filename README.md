# 📈 Young & Rich 프로젝트

**한국투자증권 API와 React를 활용한 모의 주식 투자 플랫폼**

---

## 📝 프로젝트 소개

**"Young & Rich"**는 실제 주식 시장 데이터를 기반으로 모의 투자를 경험할 수 있는 풀스택(Full-Stack) 웹 애플리케이션입니다.

- **백엔드**는 **Spring Boot**를 사용하여 안정적으로 데이터를 처리하고, **한국투자증권(KIS) Open API**와 연동하여 실시간 시세 조회, 계좌 정보, 주식 주문 등의 핵심 기능을 수행합니다.
- **프론트엔드**는 **React**를 사용하여 사용자가 실시간으로 변하는 주식 정보를 직관적으로 확인하고, 실제와 유사한 투자 경험을 할 수 있는 동적이고 반응형 UI/UX를 제공합니다.

---

## 🛠️ 주요 기술 스택

### Backend
| 구분 | 기술 | 설명 |
| --- | --- | --- |
| **언어** | Java 17 | 안정성과 풍부한 생태계를 자랑하는 주력 개발 언어 |
| **프레임워크**| Spring Boot 3.5.0 | MSA에 최적화된 백엔드 프레임워크 |
| **주요 모듈**| Spring Web, Spring Data JPA | REST API 개발 및 ORM을 위함 |
| **빌드 도구**| Gradle | 의존성 관리 및 프로젝트 빌드 자동화 |
| **데이터베이스**| MySQL | 관계형 데이터베이스 관리 시스템 (RDBMS) |
| **ORM** | Hibernate/JPA | 객체 지향 패러다임과 관계형 데이터베이스의 불일치 해소 |
| **API 연동**| KIS Open API | 한국투자증권 API를 통한 실시간 금융 데이터 처리 |

### Frontend
| 구분 | 기술 | 설명 |
| --- | --- | --- |
| **언어** | JavaScript (ES6+) | 동적인 웹 UI/UX 구현을 위한 주력 언어 |
| **라이브러리**| React | 컴포넌트 기반의 사용자 인터페이스(UI) 라이브러리 |
| **상태 관리** | React Hooks / Context API | 컴포넌트 내 상태 및 전역 상태 관리 |
| **스타일링**| CSS / CSS-in-JS | 컴포넌트별 스타일 및 전역 스타일 관리 |
| **HTTP 통신**| Axios / Fetch API | 백엔드 API 서버와의 비동기 통신 |
| **패키지 관리**| npm | Node.js 패키지 및 의존성 관리 |

---

## ⚙️ 실행 방법

### 1. 사전 요구사항
- Java Development Kit (JDK) 17 이상
- Node.js (npm 포함) 18.x 이상
- Gradle 8.x 이상
- MySQL 서버
- **한국투자증권 API KEY 발급** ([공식 가이드](https://apiportal.koreainvestment.com/))

### 2. 백엔드 설정
> **중요**: Git은 보안을 위해 `application.properties` 파일을 추적하지 않습니다. 아래 절차에 따라 설정을 직접 구성해야 합니다.

```bash
# 1. /back/src/main/resources/ 디렉토리로 이동합니다.
cd back/src/main/resources

# 2. 예제 설정 파일을 복사하여 실제 설정 파일을 생성합니다.
cp application.properties.example application.properties
```

**3. `application.properties` 파일 수정**
   방금 생성한 `application.properties` 파일을 열고, 본인의 환경에 맞게 `YOUR_DATABASE_USERNAME`, `YOUR_DATABASE_PASSWORD`, `YOUR_APP_KEY`, `YOUR_APP_SECRET` 등의 값을 채워넣습니다.

### 3. 프론트엔드 설정 및 빌드
```bash
# 1. 프론트엔드 디렉토리로 이동합니다.
cd back/src/main/front # 프로젝트 루트 기준

# 2. 의존성 패키지를 설치합니다.
npm install

# 3. 프론트엔드 애플리케이션을 빌드합니다.
npm run build
```
> **Note**: 프론트엔드 코드가 변경될 때마다 `npm run build`를 다시 실행하여 변경사항을 백엔드 정적 리소스에 반영해야 합니다.

### 4. 전체 애플리케이션 실행
```bash
# back 디렉토리에서 Gradle을 사용하여 Spring Boot 서버를 실행합니다.
cd back # 프로젝트 루트 기준
./gradlew bootRun
```
애플리케이션이 실행되면, `http://localhost:8080` 주소로 접속하여 확인할 수 있습니다.

---

## 📂 프로젝트 통합 구조
본 프로젝트는 백엔드(Spring) 프로젝트 내에 프론트엔드(React) 프로젝트가 포함된 구조입니다. Gradle 빌드 시 React 빌드 결과물이 Spring Boot의 정적 리소스로 포함됩니다.
```
yar/
├── @pictures/                # 🖼️ 화면 이미지
├── README.md                 # 📖 프로젝트 안내서
└── back/
    ├── build.gradle              # 📜 Gradle 빌드 스크립트
    └── src/
        ├── main/
        │   ├── java/com/yar/     # ☕ 백엔드 Java 소스 코드
        │   │   ├── config/       # 애플리케이션 설정 (DB, Security, KIS API 등)
        │   │   ├── controller/   # API 엔드포인트 및 요청/응답 처리
        │   │   ├── domain/       # 비즈니스 핵심 로직 및 도메인 엔티티
        │   │   ├── dto/          # 데이터 전송 객체 (Request/Response)
        │   │   ├── repository/   # 데이터베이스 접근 (JPA Repository)
        │   │   ├── service/      # 비즈니스 로직 및 트랜잭션 관리
        │   │   ├── exception/    # 예외 처리 관련 클래스
        │   │   └── util/         # 유틸리티 클래스
        │   │
        │   ├── resources/        # 🏞️ 정적 리소스 및 설정 파일
        │   │   ├── static/       # ⬅️ React 빌드 결과물이 위치하는 곳
        │   │   ├── application.properties      # ⛔ Git 추적 제외 (로컬 설정)
        │   │   └── application.properties.example # 템플릿 설정 파일
        │   │
        │   └── front/            # ⚛️ 프론트엔드 React 소스 코드
        │
        └── test/                 # 🧪 테스트 코드
```

---

## ✨ 주요 기능 및 화면

| 프론트엔드 기능 | 백엔드 API | 설명 |
| --- | --- | --- |
| **메인 대시보드** | `GET /api/stocks/rank` | 거래량, 등락률 순위 등 주요 지표를 시각화하여 보여줍니다. |
| **종목 상세 조회** | `GET /api/stocks/price/{code}` | 특정 종목의 실시간 시세, 차트, 관련 뉴스 등을 제공합니다. |
| **관심 종목 관리** | `GET/POST /api/favorites` | 사용자가 관심 있는 종목을 등록하고 관리하는 기능을 제공합니다. |
| **모의 투자 (매수/매도)** | `POST /api/orders/buy` | 실제와 같은 환경에서 주식 매수/매도 주문을 실행합니다. |
| **내 자산 현황** | `GET /api/account/balance` | 보유 종목, 평가 손익 등 자신의 자산 현황을 확인합니다. |

---

## 🖼️ 화면 구성
| 화면 | 설명 |
| --- | --- |
| ![데이터 흐름](@pictures/dataflow.PNG) | **데이터 흐름** |
| ![카카오 로그인](@pictures/kakao.png) | **카카오 로그인 화면** |
| ![메인 화면](@pictures/main.png) | **메인 화면** |
| ![보유 종목](@pictures/mystock.png) | **보유 종목 화면** |
| ![보유 자산](@pictures/mystock-2.png) | **보유 자산 화면** |
| ![검색바](@pictures/searchbar.png) | **검색바 기능** |
| ![주식 차트](@pictures/stock.png) | **주식 차트 화면** |

---

## 🏗️ 아키텍처 다이어그램

![Architecture Diagram](https://via.placeholder.com/800x400.png?text=Full-Stack+Application+Architecture)
*(여기에 전체 시스템 아키텍처 다이어그램 이미지를 추가하세요.)*
