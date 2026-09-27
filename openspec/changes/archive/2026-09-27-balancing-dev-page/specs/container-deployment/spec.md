# Spec Delta

## ADDED Requirements

### Requirement: Developer tools switch
The container SHALL serve the developer configuration from the environment variable `DEV_TOOLS`,
written each time it starts. Developer tools SHALL be enabled only when `DEV_TOOLS` is exactly
`true`, and disabled for any other value or when it is unset. `compose.yaml` SHALL pass
`DEV_TOOLS` through with the default `false`. While developer tools are enabled, the container
SHALL log a notice at start-up. The configuration SHALL NOT be cached by the browser.

#### Scenario: Default
- **WHEN** the container is started with `docker compose up` and no `DEV_TOOLS` set
- **THEN** the developer configuration says disabled and `#dev` shows the game

#### Scenario: Dev instance
- **WHEN** the container is started with `DEV_TOOLS=true`
- **THEN** `#dev` shows the developer page, and the container log contains a notice that
  developer tools are enabled

#### Scenario: Switch without rebuild
- **WHEN** `DEV_TOOLS` is changed from `true` to unset and the container is recreated without
  rebuilding the image
- **THEN** `#dev` shows the game after a reload
