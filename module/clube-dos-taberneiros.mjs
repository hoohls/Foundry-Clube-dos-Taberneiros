/**
 * Sistema Clube dos Taberneiros para Foundry VTT
 * Um sistema 2d6 focado em narrativa e simplicidade
 */

// Importar classes do sistema
import { ClubeActor } from "./documents/actor.mjs";
import { ClubeItem } from "./documents/item.mjs";
import { TaberneiroPersonagemSheet } from "./sheets/actor-sheet.mjs";
import { ClubeItemSheet } from "./sheets/item-sheet.mjs";

/* -------------------------------------------- */
/*  Inicialização do Sistema                    */
/* -------------------------------------------- */

/**
 * Hook principal de inicialização do sistema
 * Configurações fundamentais que devem ser feitas antes do Foundry estar pronto
 */
Hooks.once('init', async function() {
  console.log('Clube dos Taberneiros | Inicializando sistema v2.3.0...');

  try {
    // Validar compatibilidade do Foundry
    _validateFoundryCompatibility();
    
    // Configurar classes de documentos
    _configureDocumentClasses();
    
    // Registrar folhas (sheets)
    _registerSheets();
    
    // Registrar helpers do Handlebars
    _registerHandlebarsHelpers();
    
    // Configurar API pública do sistema
    _setupPublicAPI();
    
    // Configurar integrações do sistema
    _configureSystemIntegrations();
    
    console.log('Clube dos Taberneiros | Sistema inicializado com sucesso!');
  } catch (error) {
    console.error('Clube dos Taberneiros | Erro crítico na inicialização:', error);
    ui.notifications.error("Falha crítica na inicialização do Sistema Clube dos Taberneiros");
  }
});

/**
 * Validar compatibilidade com a versão do Foundry
 * @private
 */
function _validateFoundryCompatibility() {
  const requiredVersion = 11;
  const currentVersion = parseInt(game.version?.split('.')[0]) || 0;
  
  if (currentVersion < requiredVersion) {
    throw new Error(`Foundry VTT v${requiredVersion}+ é necessário. Versão atual: v${game.version}`);
  }
  
  console.log(`Clube dos Taberneiros | Foundry v${game.version} - Compatível ✓`);
}

/**
 * Configurar classes de documentos do sistema
 * @private
 */
function _configureDocumentClasses() {
  CONFIG.Actor.documentClass = ClubeActor;
  CONFIG.Item.documentClass = ClubeItem;
  
  console.log('Clube dos Taberneiros | Classes de documentos configuradas');
}

/**
 * Registrar folhas (sheets) do sistema
 * @private  
 */
function _registerSheets() {
  // Registrar folhas de personagem
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("clube-dos-taberneiros", TaberneiroPersonagemSheet, {
    types: ["personagem"],
    makeDefault: true,
    label: "CDT.SheetLabels.Character"
  });

  // Registrar folhas de itens
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("clube-dos-taberneiros", ClubeItemSheet, {
    types: ["habilidade", "magia", "arma", "armadura", "escudo", "equipamento", "pocao"],
    makeDefault: true,
    label: "CDT.SheetLabels.Item"
  });
  
  console.log('Clube dos Taberneiros | Folhas registradas');
}

/**
 * Configurar API pública do sistema
 * @private
 */
function _setupPublicAPI() {
  // API pública disponível globalmente
  game.cdt = {
    // Funções de rolagem
    rollTest,
    rollDamage, 
    rollSpell,
    rollWeapon,
    
    // Utilitários
    calculateXPForLevel,
    getAttributeModifier,
    canLevelUp,
    levelUp,
    
    // Informações do sistema
    version: "2.3.0",
    name: "Clube dos Taberneiros"
  };
  
  console.log('Clube dos Taberneiros | API pública configurada');
}

/**
 * Configurar integrações com outros sistemas do Foundry
 * @private
 */
function _configureSystemIntegrations() {
  // Configurar fórmula de iniciativa
  CONFIG.Combat.initiative = {
    formula: "2d6 + @acao.value",
    decimals: 0
  };

  // Configurar atributos trackáveis em tokens
  CONFIG.Actor.trackableAttributes = {
    personagem: {
      bar: ["pv", "pm"],
      value: ["pv.value", "pm.value"]
    },
    npc: {
      bar: ["pv", "pm"], 
      value: ["pv.value", "pm.value"]
    },
    criatura: {
      bar: ["pv"],
      value: ["pv.value"]
    }
  };
  
  console.log('Clube dos Taberneiros | Integrações configuradas');
}

/* -------------------------------------------- */
/*  Helpers do Handlebars                       */
/* -------------------------------------------- */

function _registerHandlebarsHelpers() {
  // Helper para verificar igualdade
  Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });

  // Helper para verificar se está selecionado
  Handlebars.registerHelper('selected', function(value, test) {
    return value === test ? 'selected' : '';
  });

  // Helper para verificar se está marcado
  Handlebars.registerHelper('checked', function(value) {
    return value ? 'checked' : '';
  });

  // Helper para juntar arrays
  Handlebars.registerHelper('join', function(array, separator) {
    return array.join(separator || ', ');
  });

  // Helper para formatar modificadores
  Handlebars.registerHelper('signedNumber', function(num) {
    return num >= 0 ? `+${num}` : `${num}`;
  });

  // Helper para capitalizar primeira letra
  Handlebars.registerHelper('capitalize', function(str) {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  // Helpers matemáticos seguros
  Handlebars.registerHelper('mult', function(a, b) {
    const numA = parseFloat(a) || 0;
    const numB = parseFloat(b) || 0;
    return numA * numB;
  });

  Handlebars.registerHelper('div', function(a, b) {
    const numA = parseFloat(a) || 0;
    const numB = parseFloat(b) || 1;
    return numB !== 0 ? numA / numB : 0;
  });

  Handlebars.registerHelper('lt', function(a, b) {
    const numA = parseFloat(a) || 0;
    const numB = parseFloat(b) || 0;
    return numA < numB;
  });

  Handlebars.registerHelper('lte', function(a, b) {
    const numA = parseFloat(a) || 0;
    const numB = parseFloat(b) || 0;
    return numA <= numB;
  });

  Handlebars.registerHelper('gt', function(a, b) {
    const numA = parseFloat(a) || 0;
    const numB = parseFloat(b) || 0;
    return numA > numB;
  });

  Handlebars.registerHelper('gte', function(a, b) {
    const numA = parseFloat(a) || 0;
    const numB = parseFloat(b) || 0;
    return numA >= numB;
  });

  // Helper para somar valores
  Handlebars.registerHelper('add', function(a, b) {
    const numA = parseFloat(a) || 0;
    const numB = parseFloat(b) || 0;
    return numA + numB;
  });

  // Helper para subtrair valores
  Handlebars.registerHelper('sub', function(a, b) {
    const numA = parseFloat(a) || 0;
    const numB = parseFloat(b) || 0;
    return numA - numB;
  });

  // Helper para verificar se um valor existe
  Handlebars.registerHelper('exists', function(value) {
    return value !== null && value !== undefined && value !== '';
  });

  // Helper para condicionais if/unless
  Handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
    switch (operator) {
      case '==':
        return (v1 == v2) ? options.fn(this) : options.inverse(this);
      case '===':
        return (v1 === v2) ? options.fn(this) : options.inverse(this);
      case '!=':
        return (v1 != v2) ? options.fn(this) : options.inverse(this);
      case '!==':
        return (v1 !== v2) ? options.fn(this) : options.inverse(this);
      case '<':
        return (v1 < v2) ? options.fn(this) : options.inverse(this);
      case '<=':
        return (v1 <= v2) ? options.fn(this) : options.inverse(this);
      case '>':
        return (v1 > v2) ? options.fn(this) : options.inverse(this);
      case '>=':
        return (v1 >= v2) ? options.fn(this) : options.inverse(this);
      case '&&':
        return (v1 && v2) ? options.fn(this) : options.inverse(this);
      case '||':
        return (v1 || v2) ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  });

  console.log('Clube dos Taberneiros | Helpers do Handlebars registrados');
}

/* -------------------------------------------- */
/*  Hooks de Sistema Otimizados                */
/* -------------------------------------------- */

/**
 * Hook para inicialização de novos atores
 * Executa apenas para personagens recém-criados
 * @param {Actor} actor - O ator criado
 * @param {Object} options - Opções de criação
 * @param {string} userId - ID do usuário que criou
 */
Hooks.on("createActor", (actor, options, userId) => {
  // Só executar para o usuário que criou e apenas para personagens
  if (userId === game.user.id && actor.type === "personagem") {
    try {
      const updates = _initializeCharacterValues(actor.system);
      if (Object.keys(updates).length > 0) {
        queueUpdate(actor, updates);
      }
    } catch (error) {
      console.error("Clube dos Taberneiros | Erro na inicialização de ator:", error);
    }
  }
});

/**
 * Inicializar valores derivados para novo personagem
 * @param {Object} system - Sistema do ator
 * @returns {Object} Updates necessários
 */
function _initializeCharacterValues(system) {
  const updates = {};
  
  try {
    // Validar estrutura do sistema
    if (!system || typeof system !== 'object') {
      console.warn("Clube dos Taberneiros | Sistema inválido para inicialização");
      return updates;
    }

    // Inicializar atributos com valores padrão e modificadores
    const defaultAttributeValue = 4;
    ['fisico', 'acao', 'mental', 'social'].forEach(attr => {
      if (!system[attr] || typeof system[attr].value !== 'number') {
        updates[`system.${attr}.value`] = defaultAttributeValue;
        updates[`system.${attr}.mod`] = 0; // Mod para atributo 4
      }
    });

    // Calcular valores derivados baseados nos atributos
    const fisicoValue = system.fisico?.value || defaultAttributeValue;
    const mentalValue = system.mental?.value || defaultAttributeValue;
    const acaoValue = system.acao?.value || defaultAttributeValue;
    
    // PV = Físico × 3 + 10
    const pvMax = Math.max(1, fisicoValue * 3 + 10);
    if (!system.pv || typeof system.pv.max !== 'number') {
      updates["system.pv.max"] = pvMax;
      updates["system.pv.value"] = pvMax;
    }
    
    // PM = Mental × 2 + 5
    const pmMax = Math.max(0, mentalValue * 2 + 5);
    if (!system.pm || typeof system.pm.max !== 'number') {
      updates["system.pm.max"] = pmMax;
      updates["system.pm.value"] = pmMax;
    }
    
    // Defesa = 10 + Ação + bônus de equipamentos
    if (!system.defesa || typeof system.defesa.value !== 'number') {
      updates["system.defesa.value"] = 10 + acaoValue;
      updates["system.defesa.base"] = 10;
      updates["system.defesa.armadura"] = 0;
      updates["system.defesa.escudo"] = 0;
      updates["system.defesa.outros"] = 0;
    }

    // Inicializar recursos se não existirem
    if (!system.recursos || typeof system.recursos !== 'object') {
      updates["system.recursos"] = {
        moedas: { cobre: 0, prata: 0, ouro: 0 },
        carga: { atual: 0, max: 40 }
      };
    }

    // Inicializar progressão
    if (!system.progressao || typeof system.progressao !== 'object') {
      updates["system.progressao"] = {
        pontosAtributo: 0,
        pontosHabilidade: 0
      };
    }

    // Inicializar nível e XP
    if (!system.nivel || typeof system.nivel.value !== 'number') {
      updates["system.nivel"] = {
        value: 1,
        xp: 0,
        xpProximo: 10
      };
    }
    
    // Inicializar detalhes se não existirem
    if (!system.detalhes || typeof system.detalhes !== 'object') {
      updates["system.detalhes"] = {
        biografia: "",
        aparencia: "",
        personalidade: "",
        historia: ""
      };
    }

  } catch (error) {
    console.error("Clube dos Taberneiros | Erro na inicialização de valores:", error);
  }

  return updates;
}

// Hook otimizado para atualizações de ator - sem setTimeout
Hooks.on("updateActor", (actor, changes, options, userId) => {
  // Só calcular valores derivados se não foi explicitamente desabilitado
  if (actor.type === "personagem" && !options.skipDerivedCalculation && userId === game.user.id) {
    try {
      const updates = _calculateDerivedValues(actor.system, changes);
      
      if (Object.keys(updates).length > 0) {
        // Usar queueUpdate para evitar loops infinitos
        queueUpdate(actor, updates);
      }
    } catch (error) {
      console.error("Clube dos Taberneiros | Erro nos cálculos derivados:", error);
    }
  }
});

/**
 * Hook para criação de novos itens
 * Atualiza valores derivados do ator pai quando necessário
 * @param {Item} item - O item criado
 * @param {Object} options - Opções de criação
 * @param {string} userId - ID do usuário que criou
 */
Hooks.on("createItem", (item, options, userId) => {
  if (_shouldUpdateActorFromItem(item, options, userId)) {
    queueItemUpdate(item.parent);
  }
});

/**
 * Hook para atualização de itens existentes
 * Verifica se as mudanças afetam o ator pai
 * @param {Item} item - O item atualizado
 * @param {Object} changes - Mudanças aplicadas
 * @param {Object} options - Opções de atualização
 * @param {string} userId - ID do usuário que atualizou
 */
Hooks.on("updateItem", (item, changes, options, userId) => {
  if (_shouldUpdateActorFromItem(item, options, userId)) {
    // Verificar se são mudanças que afetam o ator
    const relevantFields = ['equipado', 'defesa', 'peso', 'quantidade', 'penalidade'];
    const hasRelevantChanges = relevantFields.some(field => 
      changes.system?.hasOwnProperty(field)
    );
    
    if (hasRelevantChanges) {
      queueItemUpdate(item.parent);
    }
  }
});

/**
 * Hook para deleção de itens
 * Atualiza valores derivados do ator pai
 * @param {Item} item - O item deletado
 * @param {Object} options - Opções de deleção
 * @param {string} userId - ID do usuário que deletou
 */
Hooks.on("deleteItem", (item, options, userId) => {
  if (_shouldUpdateActorFromItem(item, options, userId)) {
    queueItemUpdate(item.parent);
  }
});

/**
 * Função auxiliar para verificar se deve atualizar ator a partir de item
 * @param {Item} item - O item
 * @param {Object} options - Opções da operação
 * @param {string} userId - ID do usuário
 * @returns {boolean} Se deve atualizar o ator
 */
function _shouldUpdateActorFromItem(item, options, userId) {
  return item?.parent && 
         item.parent.type === "personagem" && 
         !options.skipActorUpdate && 
         userId === game.user.id;
}

/* -------------------------------------------- */
/*  Sistema de Queue para Updates               */
/* -------------------------------------------- */

// Sistema de queue para evitar loops infinitos de update
const updateQueue = new Map();
let queueTimer = null;

/**
 * Adiciona update à queue para processamento em batch
 */
function queueUpdate(actor, updates) {
  if (!actor?.id) return;
  
  // Mesclar com updates existentes na queue
  const existing = updateQueue.get(actor.id) || {};
  const merged = foundry.utils.mergeObject(existing, updates);
  updateQueue.set(actor.id, merged);
  
  // Processar queue no próximo tick
  if (!queueTimer) {
    queueTimer = requestAnimationFrame(processUpdateQueue);
  }
}

/**
 * Processa queue de updates em batch
 */
async function processUpdateQueue() {
  queueTimer = null;
  
  for (const [actorId, updates] of updateQueue.entries()) {
    try {
      const actor = game.actors.get(actorId);
      if (actor && Object.keys(updates).length > 0) {
        await actor.update(updates, { skipDerivedCalculation: true });
      }
    } catch (error) {
      console.error(`Clube dos Taberneiros | Erro ao processar update para ator ${actorId}:`, error);
    }
  }
  
  updateQueue.clear();
}

/**
 * Queue específica para updates de itens
 */
function queueItemUpdate(actor) {
  if (!actor?.id) return;
  
  // Usar debounce para agrupar múltiplas mudanças de item
  const timerId = `item-update-${actor.id}`;
  
  if (updateQueue.has(timerId)) {
    clearTimeout(updateQueue.get(timerId));
  }
  
  const timer = setTimeout(() => {
    _updateActorFromItems(actor);
    updateQueue.delete(timerId);
  }, 50);
  
  updateQueue.set(timerId, timer);
}

/* -------------------------------------------- */
/*  Funções de Cálculo Aprimoradas              */
/* -------------------------------------------- */

/**
 * Calcular valores derivados de forma otimizada - apenas o que mudou
 * @param {Object} system - Sistema atual do ator
 * @param {Object} changes - Mudanças específicas
 * @returns {Object} Updates necessários
 */
function _calculateDerivedValues(system, changes = {}) {
  const updates = {};
  
  try {
    // Validar entrada
    if (!system || !changes.system) {
      return updates;
    }
    
    const systemChanges = changes.system;
    
    // Recalcular PV máximo APENAS se Físico mudou
    if (systemChanges.fisico?.value !== undefined) {
      const fisicoValue = Math.max(1, Math.min(15, parseInt(systemChanges.fisico.value) || 4));
      const newPvMax = Math.max(1, fisicoValue * 3 + 10);
      
      if (system.pv?.max !== newPvMax) {
        updates["system.pv.max"] = newPvMax;
        
        // Ajustar PV atual se ultrapassou o máximo
        const currentPv = system.pv?.value || 0;
        if (currentPv > newPvMax) {
          updates["system.pv.value"] = newPvMax;
        }
      }
    }
    
    // Recalcular PM máximo APENAS se Mental mudou
    if (systemChanges.mental?.value !== undefined) {
      const mentalValue = Math.max(1, Math.min(15, parseInt(systemChanges.mental.value) || 4));
      const newPmMax = Math.max(0, mentalValue * 2 + 5);
      
      if (system.pm?.max !== newPmMax) {
        updates["system.pm.max"] = newPmMax;
        
        // Ajustar PM atual se ultrapassou o máximo
        const currentPm = system.pm?.value || 0;
        if (currentPm > newPmMax) {
          updates["system.pm.value"] = newPmMax;
        }
      }
    }
    
    // Recalcular Defesa APENAS se Ação mudou
    if (systemChanges.acao?.value !== undefined) {
      const acaoValue = Math.max(1, Math.min(15, parseInt(systemChanges.acao.value) || 4));
      const defesaAtual = system.defesa || {};
      const newDefesaTotal = 10 + acaoValue + 
                            (defesaAtual.armadura || 0) + 
                            (defesaAtual.escudo || 0) + 
                            (defesaAtual.outros || 0);
      
      if (defesaAtual.value !== newDefesaTotal) {
        updates["system.defesa.value"] = newDefesaTotal;
      }
    }
    
    // Calcular modificadores de atributos se algum atributo mudou
    ['fisico', 'acao', 'mental', 'social'].forEach(attr => {
      if (systemChanges[attr]?.value !== undefined) {
        const value = Math.max(1, Math.min(15, parseInt(systemChanges[attr].value) || 4));
        const mod = Math.floor((value - 4) / 2);
        
        if (system[attr]?.mod !== mod) {
          updates[`system.${attr}.mod`] = mod;
        }
      }
    });
    
  } catch (error) {
    console.error("Clube dos Taberneiros | Erro em _calculateDerivedValues:", error);
  }

  return updates;
}

/**
 * Atualizar ator baseado em itens equipados - versão otimizada
 */
function _updateActorFromItems(actor) {
  try {
    if (!actor?.system) {
      console.warn("Clube dos Taberneiros | Ator inválido para update de itens");
      return;
    }

    const updates = {};
    let armaduraDefesa = 0;
    let escudoDefesa = 0;
    let cargaAtual = 0;

    // Calcular bônus de equipamentos de forma otimizada
    for (const item of actor.items) {
      const itemSystem = item.system;
      
      // Bônus de defesa apenas para itens equipados
      if (itemSystem?.equipado) {
        if (item.type === "armadura" && itemSystem.defesa) {
          armaduraDefesa += itemSystem.defesa;
        } else if (item.type === "escudo" && itemSystem.defesa) {
          escudoDefesa += itemSystem.defesa;
        }
      }
      
      // Calcular carga total (independente de equipado)
      if (itemSystem?.peso) {
        const quantidade = itemSystem.quantidade || 1;
        cargaAtual += itemSystem.peso * quantidade;
      }
    }

    // Verificar mudanças reais antes de atualizar
    const currentDefesa = actor.system.defesa || {};
    const currentCarga = actor.system.recursos?.carga || {};
    
    if (currentDefesa.armadura !== armaduraDefesa) {
      updates["system.defesa.armadura"] = armaduraDefesa;
    }
    
    if (currentDefesa.escudo !== escudoDefesa) {
      updates["system.defesa.escudo"] = escudoDefesa;
    }
    
    // Recalcular defesa total
    const acaoValue = actor.system.acao?.value || 4;
    const outrosBonus = currentDefesa.outros || 0;
    const newDefesaTotal = 10 + acaoValue + armaduraDefesa + escudoDefesa + outrosBonus;
    
    if (currentDefesa.value !== newDefesaTotal) {
      updates["system.defesa.value"] = newDefesaTotal;
    }
    
    // Atualizar carga com precisão
    const newCarga = Math.round(cargaAtual * 100) / 100; // Precisão de centésimos
    if (Math.abs((currentCarga.atual || 0) - newCarga) > 0.01) {
      updates["system.recursos.carga.atual"] = newCarga;
    }

    // Usar queue em vez de update direto
    if (Object.keys(updates).length > 0) {
      queueUpdate(actor, updates);
    }

  } catch (error) {
    console.error("Clube dos Taberneiros | Erro na atualização por itens:", error);
  }
}

/* -------------------------------------------- */
/*  Sistema de Rolagem Aprimorado               */
/* -------------------------------------------- */

/**
 * Função principal para testes 2d6 - versão melhorada com validação
 * @param {Object} actor - Ator fazendo o teste
 * @param {string} attribute - Nome do atributo
 * @param {number} skillBonus - Bônus de habilidade
 * @param {number} difficulty - Número de dificuldade
 * @param {Object} options - Opções adicionais
 * @returns {Promise<Object|null>} Resultado do teste ou null se erro
 */
export async function rollTest(actor, attribute, skillBonus = 0, difficulty = 9, options = {}) {
  try {
    // Validação de entrada robusta
    if (!actor || !actor.system) {
      ui.notifications.error("Ator inválido para rolagem");
      console.error("Clube dos Taberneiros | Ator inválido:", actor);
      return null;
    }
    
    if (!attribute || typeof attribute !== 'string') {
      ui.notifications.error("Atributo inválido para rolagem");
      console.error("Clube dos Taberneiros | Atributo inválido:", attribute);
      return null;
    }
    
    if (!actor.system[attribute]) {
      ui.notifications.error(`Atributo "${attribute}" não encontrado no personagem`);
      console.error("Clube dos Taberneiros | Atributo não encontrado:", attribute, actor.system);
      return null;
    }
    
    // Validar e limitar valores
    const attributeValue = Math.max(0, parseInt(actor.system[attribute]?.value) || 0);
    const validSkillBonus = Math.max(-10, Math.min(10, parseInt(skillBonus) || 0));
    const validDifficulty = Math.max(2, Math.min(20, parseInt(difficulty) || 9));
    const total = attributeValue + validSkillBonus;
    
    // Criar e avaliar rolagem
    const rollFormula = "2d6 + @total";
    const roll = new Roll(rollFormula, { total });
    await roll.evaluate();
    
    const result = roll.total;
    const naturalRoll = roll.dice[0]?.results?.reduce((sum, r) => sum + (r.result || 0), 0) || 0;
    
    // Determinar tipo de resultado com validação
    let resultType = "failure";
    let resultClass = "failure";
    let resultText = "Falha";
    
    if (naturalRoll === 12) {
      resultType = "criticalSuccess";
      resultClass = "critical-success";
      resultText = "Sucesso Crítico";
    } else if (naturalRoll === 2) {
      resultType = "criticalFailure";
      resultClass = "critical-failure";
      resultText = "Falha Crítica";
    } else if (result >= validDifficulty) {
      resultType = "success";
      resultClass = "success";
      resultText = "Sucesso";
    }
    
    // Criar mensagem de chat com validação
    const attributeDisplayName = attribute.charAt(0).toUpperCase() + attribute.slice(1);
    const flavor = options.flavor || `Teste de ${attributeDisplayName}`;
    
    const messageData = {
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: flavor,
      content: `
        <div class="cdt-roll-result ${resultClass}">
          <div class="cdt-roll-header">
            <h3>${flavor}</h3>
            <div class="cdt-roll-formula">2d6 + ${total} (${attributeDisplayName} ${attributeValue}${validSkillBonus !== 0 ? ` ${validSkillBonus >= 0 ? '+' : ''}${validSkillBonus}` : ''})</div>
          </div>
          <div class="cdt-roll-body">
            <div class="cdt-dice-result">
              <span class="cdt-dice-total">${result}</span>
              <span class="cdt-natural-roll">(${naturalRoll} + ${total})</span>
            </div>
            <div class="cdt-difficulty">ND ${validDifficulty}</div>
            <div class="cdt-result ${resultClass}">
              <strong>${resultText}</strong>
              ${result >= validDifficulty ? 
                `<span class="success-margin">Margem: ${result - validDifficulty}</span>` : 
                `<span class="failure-margin">Faltou: ${validDifficulty - result}</span>`
              }
            </div>
          </div>
        </div>
      `,
      roll: roll,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL
    };

    // Aplicar efeitos especiais para críticos com validação
    try {
      if (resultType === "criticalSuccess" && typeof options.onCriticalSuccess === 'function') {
        await options.onCriticalSuccess(actor, result);
      } else if (resultType === "criticalFailure" && typeof options.onCriticalFailure === 'function') {
        await options.onCriticalFailure(actor, result);
      }
    } catch (callbackError) {
      console.error("Clube dos Taberneiros | Erro em callback de crítico:", callbackError);
      // Não interromper o fluxo principal por erro em callback
    }
    
    // Criar mensagem de chat
    await ChatMessage.create(messageData);
    
    return { 
      roll, 
      result, 
      resultType, 
      naturalRoll, 
      attributeValue, 
      skillBonus: validSkillBonus, 
      difficulty: validDifficulty 
    };
    
  } catch (error) {
    console.error("Clube dos Taberneiros | Erro crítico na rolagem:", error);
    ui.notifications.error(`Erro ao realizar rolagem: ${error.message}`);
    return null;
  }
}

/**
 * Rolagem de dano aprimorada com validação
 * @param {string} formula - Fórmula de dano (ex: "1d6+2")
 * @param {Object} actor - Ator fazendo o dano
 * @param {Object} options - Opções adicionais
 * @returns {Promise<Roll|null>} Resultado da rolagem ou null se erro
 */
export async function rollDamage(formula, actor, options = {}) {
  try {
    // Validação de entrada
    if (!formula || typeof formula !== 'string') {
      ui.notifications.error("Fórmula de dano inválida");
      console.error("Clube dos Taberneiros | Fórmula inválida:", formula);
      return null;
    }
    
    if (!actor || !actor.system) {
      ui.notifications.error("Ator inválido para rolagem de dano");
      console.error("Clube dos Taberneiros | Ator inválido:", actor);
      return null;
    }
    
    // Sanitizar fórmula básica (remover caracteres perigosos)
    const sanitizedFormula = formula.replace(/[^0-9d+\-*/() ]/g, '');
    if (!sanitizedFormula || sanitizedFormula.length === 0) {
      ui.notifications.error("Fórmula de dano contém caracteres inválidos");
      return null;
    }
    
    // Criar e avaliar rolagem
    const roll = new Roll(sanitizedFormula);
    await roll.evaluate();
    
    // Validar resultado
    if (!roll || typeof roll.total !== 'number') {
      throw new Error("Resultado de rolagem inválido");
    }
    
    const messageData = {
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: options.flavor || "Dano",
      content: `
        <div class="cdt-damage-roll">
          <div class="cdt-damage-header">
            <h3>${options.weapon || 'Dano'}</h3>
          </div>
          <div class="cdt-damage-result">
            <span class="cdt-damage-total">${roll.total}</span>
            <span class="cdt-damage-formula">${sanitizedFormula}</span>
          </div>
        </div>
      `,
      roll: roll,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL
    };
    
    await ChatMessage.create(messageData);
    return roll;
    
  } catch (error) {
    console.error("Clube dos Taberneiros | Erro na rolagem de dano:", error);
    ui.notifications.error(`Erro ao rolar dano: ${error.message}`);
    return null;
  }
}

/**
 * Rolagem de magia com gasto automático de PM - versão validada
 * @param {Object} actor - Ator conjurando a magia
 * @param {Object} spell - Item de magia
 * @param {Object} options - Opções adicionais
 * @returns {Promise<Object|null>} Resultado da conjuração ou null se erro
 */
export async function rollSpell(actor, spell, options = {}) {
  try {
    // Validação robusta de entrada
    if (!actor || !actor.system) {
      ui.notifications.error("Ator inválido para conjuração");
      console.error("Clube dos Taberneiros | Ator inválido:", actor);
      return null;
    }
    
    if (!spell || !spell.system) {
      ui.notifications.error("Magia inválida para conjuração");
      console.error("Clube dos Taberneiros | Magia inválida:", spell);
      return null;
    }
    
    if (spell.type !== "magia") {
      ui.notifications.error("Item não é uma magia");
      return null;
    }
    
    // Validar e sanitizar valores
    const custoMP = Math.max(0, parseInt(spell.system.custoMP) || 1);
    const pmAtual = Math.max(0, parseInt(actor.system.pm?.value) || 0);
    const nivelMagia = Math.max(0, Math.min(9, parseInt(spell.system.nivel) || 1));
    
    // Verificar se tem PM suficiente
    if (pmAtual < custoMP) {
      ui.notifications.warn(`PM insuficiente! Necessário: ${custoMP}, Atual: ${pmAtual}`);
      return null;
    }
    
    // Verificar se tem o atributo Mental
    if (!actor.system.mental || typeof actor.system.mental.value !== 'number') {
      ui.notifications.error("Personagem não possui atributo Mental válido");
      return null;
    }
    
    // Calcular dificuldade da conjuração
    const baseDifficulty = 8 + nivelMagia;
    const difficulty = Math.max(5, Math.min(20, parseInt(options.difficulty) || baseDifficulty));
    
    // Fazer teste de conjuração
    const rollResult = await rollTest(actor, "mental", 0, difficulty, {
      flavor: `Conjuração de ${spell.name}`,
      onCriticalSuccess: () => {
        ui.notifications.info("Conjuração crítica! Efeito potencializado!");
      },
      onCriticalFailure: () => {
        ui.notifications.warn("Falha crítica na conjuração! PM perdido!");
      }
    });
    
    // Processar resultado da conjuração
    if (rollResult) {
      // Verificar configuração de gasto de PM
      const gastaPMSempre = game.settings.get("clube-dos-taberneiros", "gastaPMSempre") ?? true;
      const sucessoOuCritico = rollResult.resultType === "success" || rollResult.resultType === "criticalSuccess";
      
      // Gastar PM conforme configuração
      if (sucessoOuCritico || gastaPMSempre) {
        const novoValorPM = Math.max(0, pmAtual - custoMP);
        
        try {
          await actor.update({
            "system.pm.value": novoValorPM
          }, { skipDerivedCalculation: true });
          
          ui.notifications.info(`${custoMP} PM gastos. PM restante: ${novoValorPM}`);
        } catch (updateError) {
          console.error("Clube dos Taberneiros | Erro ao atualizar PM:", updateError);
          ui.notifications.warn("Erro ao gastar PM, mas magia foi conjurada");
        }
      }
      
      // Criar informações da magia para o chat
      try {
        const escola = spell.system.escola || "evocacao";
        const escolaDisplay = game.i18n.localize(`CDT.${escola.charAt(0).toUpperCase() + escola.slice(1)}`) || escola;
        
        const spellInfo = `
          <div class="cdt-spell-info">
            <div><strong>Escola:</strong> ${escolaDisplay}</div>
            <div><strong>Nível:</strong> ${nivelMagia}</div>
            <div><strong>Alcance:</strong> ${spell.system.alcance || "Toque"}</div>
            <div><strong>Duração:</strong> ${spell.system.duracao || "Instantâneo"}</div>
            ${spell.system.dano ? `<div><strong>Dano:</strong> ${spell.system.dano}</div>` : ''}
            <div class="cdt-spell-description">${spell.system.descricao || "Sem descrição"}</div>
          </div>
        `;
        
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor }),
          content: spellInfo
        });
      } catch (chatError) {
        console.error("Clube dos Taberneiros | Erro ao criar mensagem de magia:", chatError);
        // Não interromper o fluxo por erro de chat
      }
    }
    
    return rollResult;
    
  } catch (error) {
    console.error("Clube dos Taberneiros | Erro crítico na conjuração:", error);
    ui.notifications.error(`Erro ao conjurar magia: ${error.message}`);
    return null;
  }
}

/**
 * Rolagem de ataque com arma
 */
export async function rollWeapon(actor, weapon, options = {}) {
  try {
    const isRanged = weapon.system.categoria === "a-distancia";
    const attribute = isRanged ? "acao" : "fisico";
    const difficulty = options.difficulty || options.targetDefense || 10;
    
    // Verificar munição para armas à distância
    if (isRanged && weapon.system.municaoMax && weapon.system.municao <= 0) {
      ui.notifications.warn("Sem munição!");
      return null;
    }
    
    const rollResult = await rollTest(actor, attribute, 0, difficulty, {
      flavor: `Ataque com ${weapon.name}`,
      onCriticalSuccess: async () => {
        ui.notifications.info("Acerto crítico! Dano dobrado!");
        if (weapon.system.dano) {
          const damageRoll = await rollDamage(`(${weapon.system.dano}) * 2`, actor, {
            flavor: "Dano Crítico",
            weapon: weapon.name
          });
        }
      },
      onCriticalFailure: () => {
        ui.notifications.warn("Falha crítica no ataque!");
      }
    });
    
    if (rollResult && (rollResult.resultType === "success" || rollResult.resultType === "criticalSuccess")) {
      // Rolar dano normal se não foi crítico
      if (rollResult.resultType === "success" && weapon.system.dano) {
        await rollDamage(weapon.system.dano, actor, {
          flavor: "Dano",
          weapon: weapon.name
        });
      }
      
      // Gastar munição se aplicável
      if (isRanged && weapon.system.municaoMax && weapon.system.municao > 0) {
        await weapon.update({
          "system.municao": weapon.system.municao - 1
        });
      }
    }
    
    return rollResult;
    
  } catch (error) {
    console.error("Clube dos Taberneiros | Erro no ataque:", error);
    ui.notifications.error("Erro ao atacar");
    return null;
  }
}

/* -------------------------------------------- */
/*  Configurações de Sistema                    */
/* -------------------------------------------- */

// Configurações movidas para _configureSystemIntegrations() no hook init

/**
 * Hook executado quando o Foundry está completamente carregado
 * Registra configurações e inicializa recursos opcionais
 */
Hooks.once("ready", async () => {
  console.log('Clube dos Taberneiros | Sistema pronto - configurando...');
  
  try {
    // Registrar configurações do sistema
    _registerSystemSettings();
    
    // Configurar recursos adicionais baseado nas configurações
    await _initializeSystemFeatures();
    
    // Validar integridade do sistema
    _validateSystemIntegrity();
    
    console.log('Clube dos Taberneiros | Sistema configurado com sucesso!');
  } catch (error) {
    console.error('Clube dos Taberneiros | Erro na inicialização:', error);
    ui.notifications.error("Erro na inicialização do sistema Clube dos Taberneiros");
  }
});

/**
 * Registrar todas as configurações do sistema
 * @private
 */
function _registerSystemSettings() {
  // Configuração: Gastar PM sempre
  game.settings.register("clube-dos-taberneiros", "gastaPMSempre", {
    name: "CDT.Settings.GastaPMSempre.Name",
    hint: "CDT.Settings.GastaPMSempre.Hint", 
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  // Configuração: Mostrar fórmulas
  game.settings.register("clube-dos-taberneiros", "mostrarFormulas", {
    name: "CDT.Settings.MostrarFormulas.Name",
    hint: "CDT.Settings.MostrarFormulas.Hint",
    scope: "client", 
    config: true,
    type: Boolean,
    default: true
  });

  // Configuração: Criar macros automaticamente
  game.settings.register("clube-dos-taberneiros", "criarMacrosAuto", {
    name: "CDT.Settings.CriarMacrosAuto.Name",
    hint: "CDT.Settings.CriarMacrosAuto.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
  
  // Configuração: Debug mode
  game.settings.register("clube-dos-taberneiros", "debugMode", {
    name: "CDT.Settings.DebugMode.Name", 
    hint: "CDT.Settings.DebugMode.Hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false
  });
}

/**
 * Inicializar recursos opcionais do sistema
 * @private
 */
async function _initializeSystemFeatures() {
  // Criar macros pré-definidas se habilitado
  if (game.settings.get("clube-dos-taberneiros", "criarMacrosAuto")) {
    await _createPredefinedMacros();
  }
  
  // Configurar modo debug se habilitado
  if (game.settings.get("clube-dos-taberneiros", "debugMode")) {
    console.log('Clube dos Taberneiros | Modo debug ativado');
    window.CDT_DEBUG = true;
  }
}

/**
 * Validar integridade básica do sistema
 * @private
 */
function _validateSystemIntegrity() {
  const requiredFunctions = ['rollTest', 'rollDamage', 'rollSpell', 'rollWeapon'];
  const missingFunctions = requiredFunctions.filter(fn => typeof game.cdt[fn] !== 'function');
  
  if (missingFunctions.length > 0) {
    console.warn('Clube dos Taberneiros | Funções faltando:', missingFunctions);
  }
}

/**
 * Criar macros pré-definidas
 */
async function _createPredefinedMacros() {
  try {
    const macrosData = [
      {
        name: "Teste de Atributo",
        type: "script",
        scope: "global",
        command: `
// Macro: Teste de Atributo Rápido
const actor = canvas.tokens.controlled[0]?.actor || game.user.character;
if (!actor) {
  ui.notifications.warn("Nenhum personagem selecionado!");
  return;
}

new Dialog({
  title: "Teste de Atributo",
  content: \`
    <form>
      <div class="form-group">
        <label>Atributo:</label>
        <select name="attribute">
          <option value="fisico">Físico</option>
          <option value="acao">Ação</option>
          <option value="mental">Mental</option>
          <option value="social">Social</option>
        </select>
      </div>
      <div class="form-group">
        <label>Dificuldade:</label>
        <select name="difficulty">
          <option value="5">Trivial (5)</option>
          <option value="7">Fácil (7)</option>
          <option value="9" selected>Moderada (9)</option>
          <option value="11">Difícil (11)</option>
          <option value="13">Muito Difícil (13)</option>
          <option value="15">Heroica (15)</option>
        </select>
      </div>
    </form>
  \`,
  buttons: {
    roll: {
      label: "Rolar",
      callback: (html) => {
        const attribute = html.find('[name="attribute"]').val();
        const difficulty = parseInt(html.find('[name="difficulty"]').val());
        game.cdt.rollTest({ actor, attribute, difficulty });
      }
    },
    cancel: { label: "Cancelar" }
  }
}).render(true);
        `,
        img: "icons/svg/d20-grey.svg"
      },
      {
        name: "Iniciativa Rápida",
        type: "script",
        scope: "global",
        command: `
// Macro: Iniciativa Rápida para Tokens Selecionados
const tokens = canvas.tokens.controlled;
if (tokens.length === 0) {
  ui.notifications.warn("Nenhum token selecionado!");
  return;
}

for (let token of tokens) {
  if (token.actor) {
    const acao = token.actor.system.acao?.value || 0;
    const roll = new Roll("2d6 + @acao", { acao });
    roll.evaluate().then(() => {
      ChatMessage.create({
        content: \`\${token.name} rolou iniciativa: \${roll.total}\`,
        speaker: ChatMessage.getSpeaker({ token })
      });
    });
  }
}
        `,
        img: "icons/svg/clockwork.svg"
      }
    ];

    for (const macroData of macrosData) {
      const existing = game.macros.find(m => m.name === macroData.name);
      if (!existing) {
        await Macro.create(macroData);
      }
    }

    console.log('Clube dos Taberneiros | Macros pré-definidas criadas');
  } catch (error) {
    console.error('Clube dos Taberneiros | Erro ao criar macros:', error);
  }
}

/* -------------------------------------------- */
/*  Sistema de Drag & Drop Otimizado           */
/* -------------------------------------------- */

// Hook para melhorar drag & drop de compêndios
Hooks.on("dropActorSheetData", async (actor, sheet, data) => {
  if (data.type !== "Item") return true;
  
  try {
    const item = await Item.implementation.fromDropData(data);
    if (!item) return false;
    
    // Verificar se o item é compatível
    if (!_isItemCompatible(actor, item)) {
      ui.notifications.warn(`${item.name} não é compatível com ${actor.name}!`);
      return false;
    }
    
    // Verificar pré-requisitos
    if (!_checkItemPrerequisites(actor, item)) {
      const confirmed = await Dialog.confirm({
        title: "Pré-requisitos não atendidos",
        content: `${item.name} possui pré-requisitos não atendidos. Adicionar mesmo assim?`,
        yes: () => true,
        no: () => false
      });
      
      if (!confirmed) return false;
    }
    
    // Criar uma cópia do item para o ator
    const itemData = item.toObject();
    itemData.system = foundry.utils.duplicate(itemData.system);
    
    // Aplicar modificações automáticas baseadas no ator
    _applyAutoModifications(actor, itemData);
    
    // Adicionar o item
    const created = await actor.createEmbeddedDocuments("Item", [itemData]);
    ui.notifications.info(`${item.name} adicionado a ${actor.name}!`);
    
    return false; // Previne o comportamento padrão
    
  } catch (error) {
    console.error("Clube dos Taberneiros | Erro no drag & drop:", error);
    return true; // Usa comportamento padrão
  }
});

/**
 * Verificar se item é compatível com o ator
 */
function _isItemCompatible(actor, item) {
  if (actor.type !== "personagem") return true;
  
  // Verificar compatibilidade por tipo
  const incompatibleTypes = {
    "habilidade": [],
    "magia": [],
    "arma": [],
    "armadura": [],
    "escudo": [],
    "equipamento": [],
    "pocao": []
  };
  
  return !incompatibleTypes[item.type]?.includes(actor.system.classe?.toLowerCase());
}

/**
 * Verificar pré-requisitos do item
 */
function _checkItemPrerequisites(actor, item) {
  if (!item.system.prerequisitos && !item.system.nivelMinimo) return true;
  
  const system = actor.system;
  
  // Verificar nível mínimo
  if (item.system.nivelMinimo > system.nivel.value) {
    return false;
  }
  
  // Verificar pré-requisitos de atributos
  if (item.system.prerequisitos) {
    const prereqs = item.system.prerequisitos.toLowerCase();
    const attrMatches = prereqs.match(/(\w+)\s+(\d+)/g);
    
    if (attrMatches) {
      for (let match of attrMatches) {
        const [attr, min] = match.split(/\s+/);
        if (system[attr]?.value < parseInt(min)) {
          return false;
        }
      }
    }
  }
  
  return true;
}

/**
 * Aplicar modificações automáticas baseadas no ator
 */
function _applyAutoModifications(actor, itemData) {
  const system = actor.system;
  
  // Ajustar custos de MP baseado no atributo Mental
  if (itemData.type === "magia" && itemData.system.custoMP) {
    const mentalBonus = Math.floor((system.mental.value - 4) / 2);
    const newCost = Math.max(1, itemData.system.custoMP - mentalBonus);
    
    if (newCost !== itemData.system.custoMP) {
      itemData.system.custoMP = newCost;
      itemData.system.custoOriginal = itemData.system.custoMP;
    }
  }
  
  // Aplicar bônus de classe para habilidades
  const classeBonuses = {
    "guerreiro": { "combate": 1 },
    "mago": { "magicas": 1 },
    "ladino": { "gerais": 1 },
    "diplomata": { "sociais": 1 }
  };
  
  if (itemData.type === "habilidade") {
    const classe = system.classe?.toLowerCase();
    const categoria = itemData.system.categoria;
    
    if (classeBonuses[classe]?.[categoria]) {
      itemData.system.bonus = (itemData.system.bonus || 0) + classeBonuses[classe][categoria];
      itemData.system.bonusClasse = classeBonuses[classe][categoria];
    }
  }
}

/* -------------------------------------------- */
/*  Utilitários de Sistema                      */
/* -------------------------------------------- */

/**
 * Função para calcular experiência necessária para próximo nível
 */
export function calculateXPForLevel(level) {
  return level * 10; // Sistema simples: 10 XP por nível
}

/**
 * Função para determinar modificador de atributo
 */
export function getAttributeModifier(value) {
  return Math.floor((value - 4) / 2);
}

/**
 * Função para verificar se personagem pode subir de nível
 */
export function canLevelUp(actor) {
  const system = actor.system;
  return system.nivel.xp >= system.nivel.xpProximo;
}

/**
 * Função para subir nível automaticamente
 */
export async function levelUp(actor) {
  if (!canLevelUp(actor)) return false;
  
  const currentLevel = actor.system.nivel.value;
  const newLevel = currentLevel + 1;
  const xpUsed = actor.system.nivel.xpProximo;
  const remainingXP = actor.system.nivel.xp - xpUsed;
  const nextLevelXP = calculateXPForLevel(newLevel + 1);
  
  const updates = {
    "system.nivel.value": newLevel,
    "system.nivel.xp": remainingXP,
    "system.nivel.xpProximo": nextLevelXP,
    "system.progressao.pontosAtributo": actor.system.progressao.pontosAtributo + 1,
    "system.progressao.pontosHabilidade": actor.system.progressao.pontosHabilidade + 2
  };
  
  await actor.update(updates);
  
  ui.notifications.info(`${actor.name} subiu para o nível ${newLevel}!`);
  
  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `
      <div class="cdt-level-up">
        <h3>🎉 Subiu de Nível!</h3>
        <p><strong>${actor.name}</strong> agora é nível <strong>${newLevel}</strong>!</p>
        <p>Ganhou 1 ponto de atributo e 2 pontos de habilidade!</p>
      </div>
    `
  });
  
  return true;
}

