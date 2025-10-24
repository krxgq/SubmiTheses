# UML Diagrams - SumbiTheses System

System pro odevzdávání, hodnocení a zveřejňování maturitních projektů

---

## Table of Contents
1. [User Role Hierarchy](#1-user-role-hierarchy)
2. [Use Case Diagrams](#2-use-case-diagrams)
3. [Class Diagram](#3-class-diagram)
4. [Sequence Diagrams](#4-sequence-diagrams)
5. [Activity Diagram](#5-activity-diagram)
6. [ER Diagram](#6-er-diagram)

---

## 1. User Role Hierarchy

### School-Level User Roles

```mermaid
graph TB
    subgraph "School Users (SchoolUser)"
        Admin[Administrator]
        Teacher[Teacher/Učitel]
        Student[Student/Student]
    end

    subgraph "Project-Level Assignments"
        Teacher --> |assigned as| Supervisor[Supervisor/Vedoucí]
        Teacher --> |assigned as| Opponent[Opponent/Oponent]
    end

    Admin -.-> |manages| Teacher
    Admin -.-> |manages| Student
    Admin -.-> |publishes| Projects[Projects]

    Supervisor -.-> |evaluates| Projects
    Opponent -.-> |evaluates| Projects
    Student -.-> |submits| Projects

    style Admin fill:#e74c3c
    style Teacher fill:#3498db
    style Student fill:#2ecc71
    style Supervisor fill:#9b59b6
    style Opponent fill:#f39c12
```

### Role Descriptions

| Role | Czech | Description | Permissions |
|------|-------|-------------|-------------|
| **Student** | Student | Studenti školy | Submit projects, view own projects, view assigned reviews |
| **Teacher** | Učitel | Učitelé/pedagogové školy | Can be assigned as Supervisor or Opponent, write reviews, evaluate projects |
| **Administrator** | Administrátor | Správce školy | Manage users, schools, projects, publish approved projects |
| **Supervisor** | Vedoucí | Učitel přiřazený jako vedoucí projektu | Evaluate project, provide feedback, approve/reject |
| **Opponent** | Oponent | Učitel přiřazený jako oponent projektu | Review project, provide critique, grade |

---

## 2. Use Case Diagrams

### 2.1 Student Use Cases

```mermaid
graph LR
    Student((Student))

    Student --> UC1[Create Project]
    Student --> UC2[Submit Project]
    Student --> UC3[Upload Attachments]
    Student --> UC4[Add External Links]
    Student --> UC5[View Project Status]
    Student --> UC6[View Reviews]
    Student --> UC7[Edit Draft Project]
    Student --> UC8[View Public Projects]

    UC1 -.-> |until submitted| UC7
    UC2 -.-> |changes status| UC5
    UC6 -.-> |from supervisor/opponent| Reviews[(Reviews)]

    style Student fill:#2ecc71
```

### 2.2 Teacher Use Cases (as Supervisor)

```mermaid
graph LR
    Supervisor((Teacher as<br/>Supervisor))

    Supervisor --> UC1[View Assigned Projects]
    Supervisor --> UC2[Review Project]
    Supervisor --> UC3[Write Evaluation]
    Supervisor --> UC4[Provide Feedback]
    Supervisor --> UC5[Lock Project for Review]
    Supervisor --> UC6[Export Review]
    Supervisor --> UC7[View Student Details]
    Supervisor --> UC8[Recommend for Publication]

    UC2 -.-> UC3
    UC3 -.-> UC4
    UC5 -.-> |prevents changes| UC2

    style Supervisor fill:#9b59b6
```

### 2.3 Teacher Use Cases (as Opponent)

```mermaid
graph LR
    Opponent((Teacher as<br/>Opponent))

    Opponent --> UC1[View Assigned Projects]
    Opponent --> UC2[Review Project]
    Opponent --> UC3[Write Opposition]
    Opponent --> UC4[Grade Project]
    Opponent --> UC5[View Supervisor Review]
    Opponent --> UC6[Export Opposition]
    Opponent --> UC7[Provide Critical Feedback]

    UC2 -.-> UC3
    UC3 -.-> UC4
    UC5 -.-> |informs| UC3

    style Opponent fill:#f39c12
```

### 2.4 Administrator Use Cases

```mermaid
graph LR
    Admin((Administrator))

    Admin --> UC1[Manage Users]
    Admin --> UC2[Manage Schools]
    Admin --> UC3[Manage Projects]
    Admin --> UC4[Publish Projects]
    Admin --> UC5[Configure Evaluation Criteria]
    Admin --> UC6[View All Reviews]
    Admin --> UC7[Assign Teachers to Projects]
    Admin --> UC8[Generate Reports]
    Admin --> UC9[Manage Project Status]

    UC1 -.-> |includes| CreateUser[Create/Edit/Delete Users]
    UC2 -.-> |includes| ManageSchool[Create/Edit Schools]
    UC4 -.-> |changes to| UC9

    style Admin fill:#e74c3c
```

### 2.5 Complete System Use Case Diagram

```mermaid
graph TB
    Student((Student))
    Teacher((Teacher))
    Admin((Administrator))
    Public((Public<br/>Visitor))

    subgraph "Project Management"
        UC1[Create/Edit Project]
        UC2[Submit Project]
        UC3[Upload Files]
        UC4[Add Links]
    end

    subgraph "Evaluation"
        UC5[Review Project]
        UC6[Write Evaluation]
        UC7[Grade Project]
        UC8[Lock Project]
    end

    subgraph "Administration"
        UC9[Manage Users]
        UC10[Manage Schools]
        UC11[Publish Projects]
        UC12[Configure Criteria]
    end

    subgraph "Public Access"
        UC13[Browse Projects]
        UC14[Search Projects]
        UC15[View Project Details]
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC13
    Student --> UC14

    Teacher --> UC5
    Teacher --> UC6
    Teacher --> UC7
    Teacher --> UC8

    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC5

    Public --> UC13
    Public --> UC14
    Public --> UC15

    style Student fill:#2ecc71
    style Teacher fill:#3498db
    style Admin fill:#e74c3c
    style Public fill:#95a5a6
```

---

## 3. Class Diagram

```mermaid
classDiagram
    class School {
        +BigInt id
        +String name
        +String domain
        +DateTime created_at
        +DateTime updated_at
    }

    class UserRole {
        +BigInt id
        +String name
        +String description
        +DateTime created_at
        +DateTime updated_at
    }

    class SchoolUser {
        +BigInt id
        +String email
        +String first_name
        +String last_name
        +BigInt school_id
        +BigInt role_id
        +DateTime created_at
        +DateTime updated_at
    }

    class Project {
        +BigInt id
        +String title
        +BigInt supervisor_id
        +BigInt opponent_id
        +String subject
        +String description
        +String main_document
        +DateTime locked_until
        +Status status
        +DateTime created_at
        +DateTime updated_at
    }

    class ProjectStudent {
        +BigInt id
        +BigInt project_id
        +BigInt student_id
        +DateTime created_at
    }

    class Review {
        +BigInt id
        +BigInt project_id
        +BigInt reviewer_id
        +String comments
        +DateTime submitted_at
        +DateTime updated_at
    }

    class Attachment {
        +BigInt id
        +BigInt project_id
        +String filename
        +String storage_path
        +String description
        +DateTime uploaded_at
        +DateTime updated_at
    }

    class ExternalLink {
        +BigInt id
        +BigInt project_id
        +String url
        +String title
        +String description
        +DateTime added_at
        +DateTime updated_at
    }

    class Status {
        <<enumeration>>
        draft
        submitted
        locked
        public
    }

    School "1" --> "*" SchoolUser : has
    UserRole "1" --> "*" SchoolUser : defines
    SchoolUser "1" --> "*" Project : supervises
    SchoolUser "1" --> "*" Project : opposes
    SchoolUser "1" --> "*" ProjectStudent : is student
    Project "1" --> "*" ProjectStudent : has students
    Project "1" --> "*" Review : has reviews
    SchoolUser "1" --> "*" Review : writes
    Project "1" --> "*" Attachment : has
    Project "1" --> "*" ExternalLink : has
    Project --> Status : has status
```

---

## 4. Sequence Diagrams

### 4.1 Student: Submit Project Workflow

```mermaid
sequenceDiagram
    actor Student
    participant UI as Frontend
    participant API as Backend API
    participant DB as Database
    participant Storage as File Storage

    Student->>UI: Create new project
    UI->>API: POST /projects
    API->>DB: Create project (status: draft)
    DB-->>API: Project created
    API-->>UI: Project ID
    UI-->>Student: Show project form

    Student->>UI: Upload attachments
    UI->>Storage: Upload files
    Storage-->>UI: File URLs
    UI->>API: POST /attachments
    API->>DB: Save attachment metadata

    Student->>UI: Add external links
    UI->>API: POST /external_links
    API->>DB: Save links

    Student->>UI: Submit project
    UI->>API: PUT /projects/{id} (status: submitted)
    API->>DB: Update status to "submitted"
    DB-->>API: Updated
    API->>API: Notify supervisor & opponent
    API-->>UI: Success
    UI-->>Student: Project submitted
```

### 4.2 Teacher as Supervisor: Evaluate Project

```mermaid
sequenceDiagram
    actor Supervisor as Teacher (Supervisor)
    participant UI as Frontend
    participant API as Backend API
    participant DB as Database

    Supervisor->>UI: View assigned projects
    UI->>API: GET /projects?supervisor_id={id}
    API->>DB: Query projects
    DB-->>API: Projects list
    API-->>UI: Projects
    UI-->>Supervisor: Display projects

    Supervisor->>UI: Select project to review
    UI->>API: GET /projects/{id}
    API->>DB: Get project details
    DB-->>API: Project data
    API-->>UI: Project details

    Supervisor->>UI: Lock project for review
    UI->>API: PUT /projects/{id} (status: locked)
    API->>DB: Update status
    API->>API: Notify student (locked)

    Supervisor->>UI: Write evaluation
    UI->>API: POST /reviews
    API->>DB: Save review
    DB-->>API: Review saved

    Supervisor->>UI: Export review (PDF)
    UI->>API: GET /reviews/{id}/export
    API-->>UI: PDF file
    UI-->>Supervisor: Download review
```

### 4.3 Teacher as Opponent: Review Project

```mermaid
sequenceDiagram
    actor Opponent as Teacher (Opponent)
    participant UI as Frontend
    participant API as Backend API
    participant DB as Database

    Opponent->>UI: View assigned projects
    UI->>API: GET /projects?opponent_id={id}
    API->>DB: Query projects
    DB-->>API: Projects list

    Opponent->>UI: Select project
    UI->>API: GET /projects/{id}
    API->>DB: Get project + supervisor review
    DB-->>API: Project data
    API-->>UI: Project with reviews

    Opponent->>UI: Read supervisor's review
    UI-->>Opponent: Display supervisor review

    Opponent->>UI: Write opposition review
    UI->>API: POST /reviews
    API->>DB: Save opponent review
    DB-->>API: Saved

    Opponent->>UI: Grade project
    UI->>API: PUT /reviews/{id} (add grade)
    API->>DB: Update review with grade
    API->>API: Calculate final grade
    API->>API: Notify student
    API-->>UI: Success
```

### 4.4 Administrator: Publish Project

```mermaid
sequenceDiagram
    actor Admin as Administrator
    participant UI as Frontend
    participant API as Backend API
    participant DB as Database

    Admin->>UI: View evaluated projects
    UI->>API: GET /projects?status=locked
    API->>DB: Query locked projects with reviews
    DB-->>API: Projects list
    API-->>UI: Projects

    Admin->>UI: Select project for publication
    UI->>API: GET /projects/{id}
    API->>DB: Get project + all reviews
    DB-->>API: Full project data
    API-->>UI: Project details

    Admin->>UI: Review evaluations
    UI-->>Admin: Display all reviews

    Admin->>UI: Approve for publication
    UI->>API: PUT /projects/{id} (status: public)
    API->>DB: Update status to "public"
    DB-->>API: Updated
    API->>API: Add to public gallery
    API->>API: Notify student (published)
    API-->>UI: Success
    UI-->>Admin: Project published
```

---

## 5. Activity Diagram

### Project Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft: Student creates project

    Draft --> Draft: Student edits
    Draft --> Draft: Upload files/links
    Draft --> Submitted: Student submits

    Submitted --> Locked: Supervisor/Opponent locks
    Submitted --> Draft: Admin returns to draft

    Locked --> Locked: Reviews being written
    Locked --> Locked: Evaluations in progress
    Locked --> Public: Admin publishes
    Locked --> Submitted: Unlock for revision

    Public --> [*]: Project visible to public

    note right of Draft
        Status: draft
        - Editable by student
        - Not visible to evaluators
    end note

    note right of Submitted
        Status: submitted
        - Read-only for student
        - Visible to supervisor/opponent
        - Awaiting evaluation
    end note

    note right of Locked
        Status: locked
        - Completely locked
        - Under active review
        - Reviews being written
    end note

    note right of Public
        Status: public
        - Published to gallery
        - Visible to everyone
        - Archived
    end note
```

### Evaluation Workflow Activity Diagram

```mermaid
flowchart TD
    Start([Project Submitted]) --> A{Supervisor<br/>assigned?}
    A -->|Yes| B[Supervisor receives notification]
    A -->|No| X[Admin assigns supervisor]
    X --> B

    B --> C[Supervisor reviews project]
    C --> D[Supervisor writes evaluation]
    D --> E{Opponent<br/>assigned?}

    E -->|Yes| F[Opponent receives notification]
    E -->|No| Y[Admin assigns opponent]
    Y --> F

    F --> G[Opponent reviews project]
    G --> H[Opponent reads supervisor review]
    H --> I[Opponent writes opposition]

    I --> J{Both reviews<br/>completed?}
    J -->|No| Wait[Wait for completion]
    Wait --> J
    J -->|Yes| K[Calculate final grade]

    K --> L{Grade<br/>acceptable?}
    L -->|Yes| M[Lock project]
    L -->|No| N[Return for revision]
    N --> Start

    M --> O{Admin<br/>approves?}
    O -->|Yes| P[Publish to public]
    O -->|No| Q[Keep locked]

    P --> End([End - Public])
    Q --> End2([End - Archived])

    style Start fill:#2ecc71
    style End fill:#3498db
    style End2 fill:#95a5a6
```

---

## 6. ER Diagram

### Database Entity Relationships

```mermaid
erDiagram
    schools ||--o{ school_users : "has"
    user_roles ||--o{ school_users : "defines"
    school_users ||--o{ projects : "supervises"
    school_users ||--o{ projects : "opposes"
    school_users ||--o{ project_students : "is student"
    school_users ||--o{ reviews : "writes"
    projects ||--o{ project_students : "has"
    projects ||--o{ reviews : "has"
    projects ||--o{ attachments : "has"
    projects ||--o{ external_links : "has"

    schools {
        bigint id PK
        varchar name
        varchar domain UK
        timestamptz created_at
        timestamptz updated_at
    }

    user_roles {
        bigint id PK
        varchar name UK
        varchar description
        timestamptz created_at
        timestamptz updated_at
    }

    school_users {
        bigint id PK
        varchar email UK
        varchar first_name
        varchar last_name
        bigint school_id FK
        bigint role_id FK
        timestamptz created_at
        timestamptz updated_at
    }

    projects {
        bigint id PK
        varchar title
        bigint supervisor_id FK
        bigint opponent_id FK
        varchar subject
        varchar description
        varchar main_document
        timestamptz locked_until
        status status
        timestamptz created_at
        timestamptz updated_at
    }

    project_students {
        bigint id PK
        bigint project_id FK
        bigint student_id FK
        timestamptz created_at
    }

    reviews {
        bigint id PK
        bigint project_id FK
        bigint reviewer_id FK
        varchar comments
        timestamptz submitted_at
        timestamptz updated_at
    }

    attachments {
        bigint id PK
        bigint project_id FK
        varchar filename
        varchar storage_path
        varchar description
        timestamptz uploaded_at
        timestamptz updated_at
    }

    external_links {
        bigint id PK
        bigint project_id FK
        varchar url
        varchar title
        varchar description
        timestamptz added_at
        timestamptz updated_at
    }
```

---

## Summary

### Role Permissions Matrix

| Action | Student | Teacher (Supervisor) | Teacher (Opponent) | Administrator |
|--------|---------|---------------------|-------------------|--------------|
| Create project | ✅ | ❌ | ❌ | ✅ |
| Edit draft project | ✅ (own) | ❌ | ❌ | ✅ |
| Submit project | ✅ (own) | ❌ | ❌ | ✅ |
| View project | ✅ (own/public) | ✅ (assigned) | ✅ (assigned) | ✅ (all) |
| Lock project | ❌ | ✅ (assigned) | ✅ (assigned) | ✅ |
| Write review | ❌ | ✅ (as supervisor) | ✅ (as opponent) | ❌ |
| Publish project | ❌ | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ✅ |
| View public projects | ✅ | ✅ | ✅ | ✅ |
| Upload attachments | ✅ (own) | ❌ | ❌ | ✅ |
| Export reviews | ❌ | ✅ (own) | ✅ (own) | ✅ |

### Status Transitions

```
draft → submitted → locked → public
  ↑         ↑         ↑
  └─────────┴─────────┘
     (can be reverted by admin)
```

---

*Generated for SumbiTheses - Systém pro odevzdávání a hodnocení maturitních projektů*
