# GradePlanner E2E (Maestro)

Este diretório contém testes end-to-end de smoke para os fluxos principais.

## Pré-requisitos

- App a correr no simulador/emulador (build debug).
- Maestro CLI instalado.

## Execução

```bash
npm run test:e2e
```

Ou executar um fluxo específico:

```bash
maestro test e2e/flows/onboarding_smoke.yaml
maestro test e2e/flows/calendar_create_item.yaml
```

## Flows

- `onboarding_smoke.yaml`: onboarding mínimo e entrada na app principal.
- `calendar_create_item.yaml`: navegação para calendário e criação de novo compromisso.

## Observações

- Os flows usam seletores por texto e regex para tolerar PT/EN.
- O `appId` está configurado como `com.gradeplanner`. Ajuste nos YAML se o bundle id local for outro.
