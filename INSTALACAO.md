# Guia de Instalação - Sistema Clube dos Taberneiros

## 📋 Pré-requisitos

- **Foundry Virtual Tabletop** versão 11 ou superior
- **Navegador moderno** com JavaScript habilitado
- **Conexão com internet** para download de recursos

## 🚀 Instalação Passo a Passo

### Método 1: Instalação via URL (Recomendado)

1. **Abra o Foundry VTT**
   - Inicie o Foundry Virtual Tabletop
   - Faça login com suas credenciais

2. **Acesse Game Systems**
   - Na tela inicial, clique em "Game Systems"
   - Você verá uma lista dos sistemas instalados

3. **Instale o Sistema**
   - Clique no botão "Install System"
   - Cole a URL do manifesto: `[URL_DO_MANIFESTO_AQUI]`
   - Clique em "Install"
   - Aguarde o download completar

4. **Verificação**
   - O sistema "Clube dos Taberneiros" deve aparecer na lista
   - Status deve mostrar "Installed"

### Método 2: Instalação Manual

1. **Download dos Arquivos**
   - Baixe o arquivo ZIP do sistema
   - Extraia em uma pasta temporária

2. **Localizar Diretório do Foundry**
   - **Windows:** `%LOCALAPPDATA%/FoundryVTT/Data/systems/`
   - **macOS:** `~/Library/Application Support/FoundryVTT/Data/systems/`
   - **Linux:** `~/.local/share/FoundryVTT/Data/systems/`

3. **Copiar Arquivos**
   - Copie a pasta extraída para o diretório `systems`
   - Renomeie para `clube-dos-taberneiros`
   - Estrutura final: `systems/clube-dos-taberneiros/system.json`

4. **Reiniciar Foundry**
   - Feche completamente o Foundry VTT
   - Inicie novamente
   - Verifique se o sistema aparece na lista

## 🌍 Criando um Mundo

### Configuração Inicial

1. **Criar Novo Mundo**
   - Na tela inicial, clique em "Create World"
   - Preencha os campos:
     - **World Title:** Nome do seu mundo
     - **Data Path:** Deixe padrão ou personalize
     - **Game System:** Selecione "Clube dos Taberneiros"

2. **Configurações Avançadas**
   - **Description:** Descrição opcional do mundo
   - **Background Image:** Imagem de fundo (opcional)
   - **Next Session:** Data da próxima sessão (opcional)

3. **Criar e Iniciar**
   - Clique em "Create World"
   - Aguarde a criação
   - Clique em "Launch World"

### Configurações Recomendadas

1. **Configurações de Sistema**
   - Acesse "Game Settings" → "System Settings"
   - Configure conforme suas preferências

2. **Configurações de Combate**
   - **Initiative Formula:** `2d6 + @attributes.acao.value` (já configurado)
   - **Decimal Places:** 0
   - **Skip Defeated:** Habilitado (recomendado)

3. **Configurações de Token**
   - **Default Token Settings:**
     - **Bar 1:** `system.pv` (Pontos de Vida)
     - **Bar 2:** `system.pm` (Pontos de Magia)
     - **Display Bars:** Always for Owner

## 👥 Configurando Usuários

### Permissões Básicas

1. **Jogadores**
   - **Role:** Player
   - **Permissions:** 
     - Create Actors: Enabled
     - Create Items: Limited
     - Use File Browser: Disabled

2. **Mestres Assistentes**
   - **Role:** Trusted Player
   - **Permissions:**
     - Create Actors: Enabled
     - Create Items: Enabled
     - Modify Configuration: Limited

3. **Mestre Principal**
   - **Role:** Gamemaster
   - **Permissions:** Todas habilitadas

### Configurações de Compêndio

1. **Visibilidade**
   - Todos os compêndios visíveis para Players
   - Permissão de Observer para itens
   - Permissão de Owner para Assistants

2. **Importação**
   - Jogadores podem importar de compêndios
   - Não podem modificar compêndios originais

## 📦 Verificando Compêndios

### Compêndios Incluídos

1. **Habilidades**
   - Combate, Mágicas, Sociais, Gerais
   - 40+ habilidades organizadas

2. **Magias**
   - 6 escolas de magia
   - Níveis 1-6 incluindo superiores
   - 30+ magias balanceadas

3. **Armas**
   - Corpo a corpo e à distância
   - Progressão por nível
   - 25+ armas variadas

4. **Armaduras**
   - Leves, médias e pesadas
   - Escudos incluídos
   - 20+ opções de proteção

5. **Equipamentos**
   - Itens gerais de aventura
   - Ferramentas especializadas
   - 30+ equipamentos úteis

6. **Poções**
   - Cura, PM e efeitos especiais
   - Sistema balanceado
   - 15+ poções diferentes

### Testando Compêndios

1. **Abrir Compêndio**
   - Clique no compêndio desejado
   - Verifique se os itens carregam

2. **Importar Item de Teste**
   - Arraste um item para um ator
   - Verifique se funciona corretamente

3. **Testar Funcionalidades**
   - Teste rolagens de habilidades
   - Teste conjuração de magias
   - Teste ataques com armas

## 🎭 Criando Primeiro Personagem

### Passo a Passo

1. **Criar Ator**
   - Clique em "Create Actor"
   - Selecione tipo "Personagem"
   - Nomeie o personagem

2. **Configurar Atributos**
   - Distribua pontos entre Físico, Ação, Mental, Social
   - Valores recomendados: 4-8 para iniciantes
   - PV e PM são calculados automaticamente

3. **Escolher Raça e Classe**
   - Preencha campos de Raça e Classe
   - Consulte livro do jogador para opções

4. **Adicionar Habilidades**
   - Arraste habilidades dos compêndios
   - Comece com 2-3 habilidades básicas
   - Foque na especialização da classe

5. **Equipar Itens**
   - Adicione armas e armaduras
   - Marque como "equipado"
   - Defesa é calculada automaticamente

6. **Finalizar**
   - Preencha biografia e aparência
   - Configure token se necessário
   - Teste funcionalidades básicas

## 🔧 Solução de Problemas

### Problemas de Instalação

**Sistema não aparece:**
```
1. Verifique URL do manifesto
2. Confirme conexão com internet
3. Tente instalação manual
4. Verifique logs do console
```

**Erro de permissões:**
```
1. Execute Foundry como administrador
2. Verifique permissões da pasta Data
3. Desabilite antivírus temporariamente
4. Reinstale o Foundry se necessário
```

**Compêndios vazios:**
```
1. Verifique arquivos .db na pasta packs
2. Reimporte compêndios
3. Recrie o mundo
4. Verifique integridade dos arquivos
```

### Problemas de Funcionamento

**Fichas não carregam:**
```
1. Verifique console do navegador
2. Desabilite outros módulos
3. Limpe cache do navegador
4. Atualize Foundry VTT
```

**Cálculos incorretos:**
```
1. Verifique valores de atributos
2. Confirme fórmulas no template.json
3. Recarregue a ficha
4. Recrie o personagem se necessário
```

**Rolagens não funcionam:**
```
1. Verifique JavaScript habilitado
2. Confirme permissões de dados
3. Teste em navegador diferente
4. Verifique conflitos de módulos
```

## 📞 Suporte

### Recursos de Ajuda

1. **Documentação**
   - README.md completo
   - Livro do Jogador
   - Escudo do Mestre

2. **Comunidade**
   - Discord do Foundry VTT
   - Fóruns oficiais
   - Grupos de RPG

3. **Suporte Técnico**
   - Issues no GitHub
   - Email de suporte
   - Documentação online

### Informações de Versão

- **Versão Atual:** 1.0.0
- **Foundry Compatível:** v11+
- **Última Atualização:** [DATA]
- **Próxima Versão:** [ROADMAP]

---

**Instalação concluída com sucesso!** 🎉

Agora você está pronto para começar suas aventuras no sistema Clube dos Taberneiros!

