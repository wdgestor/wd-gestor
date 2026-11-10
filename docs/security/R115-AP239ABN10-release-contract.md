# WD Gestor — R115-AP239ABN10

## Contrato de segurança para liberação

PRODUCTION_GATE=BLOCKED
RISK_ACCEPTANCE=NOT_GRANTED
IMMEDIATE_GLOBAL_REVOCATION=NOT_PROVEN

Data da decisão: 2026-11-09
Escopo: autenticação canônica do Gestor e módulos dependentes
Ambiente da evidência: HTTP local, testes sintéticos

## 1. Evidências certificadas

- ABW13: regressão de autenticação e Escalas aprovada.
- ABN6R: expiração absoluta de oito horas implementada.
- ABN7: prova HTTP de expiração aprovada.
- ABN9: correção da reemissão de SID expirado aprovada.
- ABN9: 12 testes de política e 67 testes de regressão aprovados.
- A certificação é local; não autoriza produção automaticamente.

## 2. Risco residual AP239ABN

UNCONFIRMED_LOGOUT_HTTP=503
STALE_COOKIE_REPLAY_AFTER_ALL_WRITES_FAIL=200

Cenário:

1. Um usuário possui sessão autenticada válida.
2. O usuário solicita logout.
3. MongoDB e DynamoDB não confirmam a revogação.
4. A destruição da sessão e a limpeza persistente também falham.
5. O servidor retorna HTTP 503 e instrui o navegador a apagar o cookie.
6. Uma cópia anterior do cookie pode continuar válida.
7. Após o restabelecimento das consultas, a sessão pode voltar a ser aceita
   porque nenhuma revogação foi registrada.

O HTTP 503 não é sucesso de logout.

A exclusão do cookie no navegador não é prova de revogação global.

O limite absoluto de oito horas reduz a duração possível da sessão
desde o login, mas não assegura revogação imediata.

## 3. Contratos obrigatórios

- Não reintroduzir fluxos legados de autenticação ou autoridade.
- Preservar AuthContext V1.
- Preservar unitScope e a separação de tenants.
- Não autorizar acesso com leitura de revogação inconclusiva.
- Não converter logout não confirmado em sucesso.
- Não apresentar expiração absoluta como substituta da revogação.
- Não usar cache local como autoridade global de revogação.
- Não considerar provedores simulados como certificação de AWS real.
- Não permitir liberação comercial de produção apenas porque a regressão passou.

## 4. Conduta operacional em incidente

Quando houver LOGOUT_NOT_CONFIRMED:

- Tratar o evento como falha de segurança relevante.
- Não informar ao usuário que a sessão foi revogada com sucesso.
- Investigar a disponibilidade dos provedores de revogação e do session store.
- Preservar logs operacionais sem registrar cookies, tokens ou SIDs em texto claro.
- Confirmar a restauração das leituras antes de considerar o incidente estabilizado.
- Considerar invalidação global emergencial das sessões somente mediante
  procedimento operacional previamente testado e autorizado.
- Não presumir que um segundo logout sem o cookie original revogue a sessão anterior.
- Registrar a ocorrência e o resultado das ações de contenção.

Este contrato nao implementa alertas externos nem um procedimento automatizado
de invalidação global.

## 5. Condições para retirar o bloqueio

A liberação requer uma decisão documentada com uma das alternativas:

A. Mitigação técnica:
   - Mecanismo compartilhado com garantia demonstrável de invalidação.
   - Prova HTTP da falha total e da recuperação.
   - Regressão integral aprovada.
   - Procedimento de resposta a incidentes testado.

B. Aceitação formal de risco residual:
   - Responsável identificado pela decisão.
   - Escopo da aceitação e sistemas afetados.
   - Risco e duração máxima de exposição explicitados.
   - Controles compensatórios e monitoramento operacional definidos.
   - Plano de resposta e eventual invalidação de sessões.
   - Prazo de revisão.
   - Autorização expressa antes de qualquer alteração do release gate.

Nenhuma das alternativas foi declarada concluída neste registro.

## 6. Resultado

ABN10_CONTRACT=RECORDED
ABN10_RELEASE_AUTHORIZATION=DENIED
PRODUCTION_GATE=BLOCKED

Este documento não altera automaticamente a configuração de deploy.
O verificador local deve ser integrado ao processo real de CI/CD antes
de ser considerado um bloqueio automatizado de publicação.