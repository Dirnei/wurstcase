## MODIFIED Requirements

### Requirement: Broken code does not produce an image
Building the image SHALL fail if the automated tests, the type check or the production build
fail. The image build SHALL run the tests as a CI run, so timing guards use their CI limits (the
60-minute simulation guard allows 10 s instead of 4 s). A plain local test run SHALL keep the
strict limits. The CI setting SHALL apply only to the build stage and SHALL NOT be present in the
final image.

#### Scenario: Failing test
- **WHEN** a test in the suite fails and the image is built
- **THEN** the build stops with an error and no new image is produced

#### Scenario: Busy build machine
- **WHEN** the image is built on a loaded machine where the 60-minute simulation takes 5 s
- **THEN** the speed guard passes and the image is produced

#### Scenario: Local tests stay strict
- **WHEN** the author runs the tests locally without CI set and the 60-minute simulation takes 5 s
- **THEN** the speed guard fails

#### Scenario: Pathological slowdown still stops the build
- **WHEN** a change makes the 60-minute simulation take 12 s and the image is built
- **THEN** the build stops with an error and no new image is produced
