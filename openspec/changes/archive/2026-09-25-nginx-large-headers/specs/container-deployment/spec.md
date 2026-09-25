# Spec Delta

## ADDED Requirements

### Requirement: Large request headers accepted
The server SHALL accept request header lines, including the `Cookie` header, of up to 32 KB and
serve the request normally. Header lines larger than 32 KB SHALL be rejected with status 400.

#### Scenario: Many localhost cookies
- **WHEN** a browser requests `/` with a 16 KB `Cookie` header from other apps on `localhost`
- **THEN** the server responds 200 with the game page

#### Scenario: Oversized header
- **WHEN** a client requests `/` with a 40 KB `Cookie` header
- **THEN** the server responds 400
