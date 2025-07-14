# Sistema Clube dos Taberneiros para Foundry VTT

Um sistema completo para Foundry Virtual Tabletop baseado no RPG Clube dos Taberneiros, focado em narrativa e simplicidade com mecânicas 2d6.

## 📋 Características

### ⚡ Sistema 2d6 Simplificado
- **Testes simples:** 2d6 + Atributo + Habilidade vs ND
- **4 Atributos:** Físico, Ação, Mental, Social
- **6 Níveis de Dificuldade:** Trivial (5) a Heroica (15)
- **Progressão natural:** Do nível 1 ao 10

### 🎭 Criação de Personagem Completa
- **4 Classes:** Guerreiro, Mago, Ladino, Diplomata
- **6 Raças:** Humano, Elfo, Anão, Halfling, Tiefling, Goblin
- **Sistema de Antecedentes** para personalização
- **Cálculo automático** de PV, PM e Defesa

### ⚔️ Sistema de Combate Tático
- **Iniciativa 2d6 + Ação**
- **Defesa passiva:** 10 + Ação + Armadura + Escudo
- **Críticos e falhas** especiais
- **Condições de status** completas

### 🔮 Sistema de Magia Robusto
- **6 Escolas de Magia:** Evocação, Abjuração, Transmutação, Ilusão, Divinação, Necromancia
- **6 Níveis de Magia:** Do básico ao épico
- **Sistema PM:** Mental × 2 + 5
- **Magias superiores** para campanhas épicas

### 🛡️ Equipamentos Expandidos
- **150+ itens diferentes** organizados por nível
- **Armas, armaduras, itens mágicos** e poções
- **Sistema de progressão** com níveis mínimos
- **Poções de PM** para magos

## 🚀 Instalação

### Método 1: Instalação Automática (Recomendado)
1. Abra o Foundry VTT
2. Vá para "Game Systems"
3. Clique em "Install System"
4. Cole a URL do manifesto: `[URL_DO_MANIFESTO]`
5. Clique em "Install"

### Método 2: Instalação Manual
1. Baixe o arquivo ZIP do sistema
2. Extraia na pasta `Data/systems/` do Foundry
3. Renomeie a pasta para `clube-dos-taberneiros`
4. Reinicie o Foundry VTT

## 📖 Como Usar

### Criando um Mundo
1. Crie um novo mundo no Foundry
2. Selecione "Clube dos Taberneiros" como sistema
3. Configure as opções desejadas
4. Inicie o mundo

### Criando Personagens
1. Crie um novo Ator do tipo "Personagem"
2. Preencha os atributos básicos (Físico, Ação, Mental, Social)
3. Escolha raça, classe e antecedente
4. Os valores de PV, PM e Defesa são calculados automaticamente
5. Adicione habilidades e equipamentos dos compêndios

### Usando Compêndios
O sistema inclui compêndios com:
- **Habilidades:** Combate, mágicas, sociais e gerais
- **Magias:** Organizadas por escola e nível
- **Armas:** Corpo a corpo e à distância
- **Armaduras:** Leves, médias e pesadas
- **Equipamentos:** Itens gerais e aventura
- **Poções:** Cura, PM e efeitos especiais

### Realizando Testes
1. Clique no atributo ou habilidade desejada
2. O sistema rola 2d6 + modificadores automaticamente
3. Compare com a dificuldade estabelecida pelo Mestre
4. Interprete o resultado (sucesso/falha/crítico)

### Sistema de Combate
1. **Iniciativa:** Automática com 2d6 + Ação
2. **Ataques:** Clique na arma para rolar ataque
3. **Defesa:** Calculada automaticamente
4. **Dano:** Rolado automaticamente em caso de acerto
5. **Condições:** Aplicadas manualmente conforme necessário

### Conjurando Magias
1. Clique na magia desejada na aba "Magias"
2. O sistema verifica se há PM suficientes
3. Rola teste de conjuração automaticamente
4. Aplica efeitos conforme descrição da magia
5. Deduz PM gastos automaticamente

## 🎯 Níveis de Dificuldade

| Dificuldade | ND | Quando Usar |
|-------------|----|-----------| 
| **Trivial** | 5 | Ações básicas, dar confiança |
| **Fácil** | 7 | Tarefas simples, momentum positivo |
| **Moderada** | 9 | Padrão da maioria dos testes |
| **Difícil** | 11 | Desafios sérios, especialização |
| **Muito Difícil** | 13 | Feitos impressionantes |
| **Heroica** | 15 | Momentos épicos |

## ⚙️ Configurações

### Tokens
- **Barra 1:** Pontos de Vida (PV)
- **Barra 2:** Pontos de Magia (PM)
- **Configuração automática** para novos tokens

### Iniciativa
- **Fórmula:** 2d6 + Ação
- **Ordem decrescente** (maior age primeiro)

### Chat
- **Rolagens automáticas** com resultados formatados
- **Críticos destacados** em cores
- **Falhas críticas** com efeitos especiais

## 🔧 Personalização

### Modificando Compêndios
1. Importe itens dos compêndios para o mundo
2. Edite conforme necessário
3. Use como base para novos itens

### Criando Novos Itens
1. Use os templates existentes como base
2. Preencha todos os campos obrigatórios
3. Teste funcionalidade antes de distribuir

### Regras da Casa
- Modifique NDs conforme seu estilo de jogo
- Ajuste custos de PM para balanceamento
- Crie novas habilidades usando os templates

## 🐛 Solução de Problemas

### Problemas Comuns

**Sistema não aparece na lista:**
- Verifique se o arquivo `system.json` está presente
- Confirme que a pasta está em `Data/systems/`
- Reinicie o Foundry VTT

**Fichas não carregam:**
- Verifique se todos os arquivos de template estão presentes
- Confirme permissões de arquivo
- Verifique console do navegador para erros

**Compêndios vazios:**
- Reimporte os compêndios
- Verifique se os arquivos `.db` estão presentes
- Recrie o mundo se necessário

**Cálculos automáticos não funcionam:**
- Verifique se o JavaScript está habilitado
- Confirme que não há conflitos com outros módulos
- Recarregue a página

## 📚 Recursos Adicionais

### Documentação Completa
- **Livro do Jogador:** Manual completo com todas as regras
- **Escudo do Mestre:** Referência rápida para mestres
- **Exemplos de Jogo:** Situações práticas explicadas

### Suporte
- **Issues:** Reporte bugs e sugestões no GitHub
- **Discussões:** Participe da comunidade
- **Atualizações:** Acompanhe novas versões

## 📄 Licença

Este sistema é baseado no RPG Clube dos Taberneiros e é distribuído sob licença [ESPECIFICAR LICENÇA].

## 🙏 Créditos

- **Sistema Original:** Clube dos Taberneiros
- **Implementação Foundry:** Manus AI
- **Ícones:** Font Awesome e Game Icons
- **Comunidade:** Foundry VTT Community

---

**Versão:** 1.0.0  
**Compatibilidade:** Foundry VTT v11+  
**Última Atualização:** [DATA]

Para mais informações, visite: [LINK_DO_PROJETO]

