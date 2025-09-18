### 📚 목차
 팀원 소개 및 역할  

 프로젝트 소개  

 기술 스택  

 API 문서  

 팀 전체 회고  

 My 작업 리스트  

 최종 후기  

---

## 🎵 MPS 프로젝트 회고록 (이상암 – 클라이언트 파트)

### 팀원 소개 및 역할

| 이름       | 역할                   | 주요 담당 업무                                                 | GitHub                                                                                                    |
| -------- | -------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 김민교 (팀장) | 스마트 컨트랙트 / 음원 API 개발 | Ethereum 기반 스마트 컨트랙트 설계 및 배포, 음원 등록/재생 API 구현            | <img src="https://github.com/Sialsry.png" width="60px"><br>[Sialsry](https://github.com/Sialsry)          |
| 이상암      | 클라이언트 풀스택 개발자        | Next.js 기반 클라이언트 설계 및 구현, 사용자 페이지·마이페이지·통계 화면 개발, API 연동 | <img src="https://github.com/sangam0919.png" width="60px"><br>[sangam0919](https://github.com/sangam0919) |
| 김지은      | 백오피스 개발              | 기업 회원 관리, 관리자 페이지 개발, 데이터 검증 및 통계 조회 기능 구현               | <img src="https://github.com/zzeen2.png" width="60px"><br>[zzeen2](https://github.com/zzeen2)             |



---

### 프로젝트 소개

**MPS(Music Performance Statistics)**는 블록체인 기반 음원 통계 관리 플랫폼입니다.  
기업 회원이 등록한 음원의 사용 내역과 리워드 현황을 투명하게 관리할 수 있도록 설계되었습니다.  

- **Client**:  
  기업은 특정 음원을 사용하면 토큰 형태의 리워드를 지급받을 수 있고, 이 리워드는 플랫폼 이용료 할인 등으로 활용 가능합니다.  
- **Admin**:  
  관리자는 기업 등록, 음원 검증, 사용 데이터 확인 등을 통해 서비스의 신뢰성을 확보합니다.  

내 역할은 **클라이언트 풀스택 개발**을 담당하여,  
기업 사용자가 가입 → 로그인 → 음원 검색/리스트 조회 → 통계 확인까지의 흐름을 원활히 제공하는 웹 UI를 구축하는 것이었다.  

---

### 🛠 기술 스택
## 프론트엔드
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

## 백엔드 (연동)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-00E599?style=for-the-badge&logo=drizzle&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)


## 협업 툴 및 기타
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonwebservices&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![Notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)

---

### 📑 API 문서 (클라이언트 주요 API)

#### 인증
| 메소드 | 엔드포인트 | 설명 |
|--------|------------|------|
| POST | `/api/auth/login` | 클라이언트 로그인 |
| POST | `/api/companies/register` | 기업 회원가입 |
| GET  | `/api/companies/business_numbers` | 사업자 번호 조회 |

#### 음원
| 메소드 | 엔드포인트 | 설명 |
|--------|------------|------|
| GET | `/api/musics` | 음원 목록 조회 |
| GET | `/api/musics/:id/lyrics.txt` | 가사 다운로드 |

#### 리워드
| 메소드 | 엔드포인트 | 설명 |
|--------|------------|------|
| POST | `/api/me/subscript` | 구독 구매 |
| GET  | `/api/me/history` | 구매/리워드 내역 조회 |
| GET  | `/api/me/rewards` | 리워드 값 조회 |
| GET  | `/api/me/plays` | 유효재생 로그 |
| DELETE | `/api/me/using/:musicId` | 음원 사용 취소 |

#### 기업
| 메소드 | 엔드포인트 | 설명 |
|--------|------------|------|
| PUT  | `/api/companies/{id}` | 기업 정보 수정 |
| POST | `/api/companies/{id}/regenerate-api-key` | API 키 재생성 (클라이언트) |

---

### 팀 전체 회고 (이상암 관점)

#### Keep
- 단순한 화면 구현에 그치지 않고, 실제 사용자가 어떻게 페이지를 사용할지 지속적으로 고민했다.  
- 여러 요소 선택/검색 과정을 시뮬레이션하며 사용자가 자연스럽게 흐름을 따라갈 수 있도록 UX를 다듬었다.  

#### Problem
- 사용자 경험을 더 자연스럽게 만들고 싶다는 욕심이 커질수록 구현해야 할 부분이 늘어났다.  
- 디테일을 챙기다 보니 일정 관리 우선순위 설정이 아쉬웠다.  
- 특히 **음원 필터링 기능**에서 사용자가 원하는 조건(장르, 기업별 사용 내역 등)을 직관적으로 적용하기 어렵다는 피드백을 받았다.  

#### Try
- 핵심 기능과 부가 기능을 구분해 우선순위를 명확히 세우는 방식으로 개선이 필요하다고 느꼈다.  
- 필터링 기능은 단순 텍스트 검색이 아닌 **카테고리별, 조건별 조합**이 가능하도록 개선할 계획이다.  
- 이렇게 하면 사용자가 원하는 음원을 빠르게 찾고, 기업별 사용 내역과 연결해 실질적인 데이터를 얻을 수 있어 효율적일 것이다.  

---

### My 작업 리스트

- **회원가입/로그인 페이지**  
  - 기업 회원 전용 가입 및 로그인 UI 구현  
  - 국세청 API와 연동하여 사업자 인증 처리  

- **메인 페이지**  
  - 음원 검색 및 필터링 기능 개발  
  - 구독/무료 여부에 따라 접근 권한 분리  

- **음원 리스트 & 상세 페이지**  
  - 음원 목록 조회, 가사 다운로드 기능 구현  
  - 음원 상세보기 및 재생/사용 로그 확인  

- **마이페이지**  
  - 기업별 음원 사용 내역, 리워드 내역 표시  
  - 프로필 수정, 구독 내역 관리  

- **통계 페이지**  
  - Chart.js를 이용해 사용 현황/리워드 데이터 시각화  

---

### 최종 후기

이번 프로젝트에서 나는 **클라이언트 풀스택 개발자**로서  
사용자 흐름 전체(회원가입 → 로그인 → 음원 검색 → 통계 조회)를 설계하고 구현했다.  

특히 **필터링 기능**은 단순 검색에서 벗어나 다양한 조건을 적용할 수 있도록 구조를 설계했지만,  
시간 제약상 모든 세부 기능을 구현하지 못한 아쉬움이 있었다.  
그러나 이 과정에서 **사용자 경험을 고려한 UI/UX 설계와 데이터 연동의 중요성**을 크게 배울 수 있었다.  

다음에는 핵심 기능을 안정적으로 구현한 뒤, 여유가 생기면 점진적으로 개선하는 접근을 취할 것이다.  
이를 통해 더 완성도 높은 사용자 경험을 제공할 수 있다고 확신한다.  
