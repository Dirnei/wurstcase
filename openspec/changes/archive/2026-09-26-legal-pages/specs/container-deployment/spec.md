# Spec Delta

## ADDED Requirements

### Requirement: Operator details from environment variables
The container SHALL build the operator details shown on the legal pages from the environment
variables `LEGAL_NAME`, `LEGAL_STREET`, `LEGAL_POSTAL_CODE`, `LEGAL_CITY`, `LEGAL_COUNTRY`,
`LEGAL_EMAIL` and `LEGAL_HOSTING_PROVIDER` each time it starts. `compose.yaml` SHALL pass them
through with obvious placeholder defaults. While any placeholder default is in use, the container
SHALL log a warning at start-up. Values SHALL be shown exactly as given, including quotes and
umlauts.

#### Scenario: Defaults
- **WHEN** the container is started with `docker compose up` and no `LEGAL_*` variables set
- **THEN** the Impressum shows the placeholder details and the container log contains a warning
  that placeholder legal details are in use

#### Scenario: Real details
- **WHEN** the container is started with `LEGAL_NAME="Jörg \"Tofu\" Müller"`
- **THEN** the Impressum shows `Jörg "Tofu" Müller` and no placeholder warning is logged for the
  name

#### Scenario: Change without rebuild
- **WHEN** `LEGAL_EMAIL` is changed and the container is recreated without rebuilding the image
- **THEN** the Impressum shows the new email

#### Scenario: Fresh details after restart
- **WHEN** a player reloads the page after the operator details were changed
- **THEN** the player sees the new details, not a cached copy

### Requirement: Anonymized access logs
The server SHALL NOT write full client IP addresses to its access log. IPv4 addresses SHALL be
logged with the last octet set to 0, IPv6 addresses with all but the first 48 bits set to 0.

#### Scenario: IPv4 client
- **WHEN** a client with the address 172.24.0.1 requests `/`
- **THEN** the access log line shows 172.24.0.0 and not 172.24.0.1
