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

Hooks.once('init', async function() {
  console.log('Clube dos Taberneiros | Inicializando sistema...');

  // Definir classes de documentos
  CONFIG.Actor.documentClass = ClubeActor;
  CONFIG.Item.documentClass = ClubeItem;

  // Registrar folhas de personagem
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("clube-dos-taberneiros", TaberneiroPersonagemSheet, {
    types: ["personagem"],
    makeDefault: true
  });

  // Registrar folhas de itens
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("clube-dos-taberneiros", ClubeItemSheet, {
    types: ["habilidade", "magia", "arma", "armadura", "escudo", "equipamento", "pocao"],
    makeDefault: true
  });

  // Registrar helpers do Handlebars
  _registerHandlebarsHelpers();

  // Configurar sistema para uso de macros
  game.cdt = {
    rollTest: rollTest,
    rollDamage: rollDamage,
    rollSpell: rollSpell,
    rollWeapon: rollWeapon
  };

  console.log('Clube dos Taberneiros | Sistema inicializado com sucesso!');
});

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
/*  Hooks de Sistema                            */
/* -------------------------------------------- */

// Hook para quando um ator é criado
Hooks.on("createActor", (actor, options, userId) => {
  if (actor.type === "personagem") {
    // Calcular valores derivados iniciais com validação
    const updates = _initializeCharacterValues(actor.system);
    if (Object.keys(updates).length > 0) {
      actor.update(updates, { skipDerivedCalculation: true });
    }
  }
});

/**
 * Inicializar valores derivados para novo personagem
 */
function _initializeCharacterValues(system) {
  const updates = {};
  
  try {
    // Inicializar atributos se não definidos
    ['fisico', 'acao', 'mental', 'social'].forEach(attr => {
      if (!system[attr] || system[attr].value === undefined) {
        updates[`system.${attr}.value`] = 4;
      }
    });

    // Calcular PV máximo inicial
    const fisicoValue = system.fisico?.value || 4;
    const pvMax = Math.max(1, fisicoValue * 3 + 10);
    updates["system.pv.max"] = pvMax;
    updates["system.pv.value"] = pvMax;
    
    // Calcular PM máximo inicial
    const mentalValue = system.mental?.value || 4;
    const pmMax = Math.max(0, mentalValue * 2 + 5);
    updates["system.pm.max"] = pmMax;
    updates["system.pm.value"] = pmMax;
    
    // Calcular Defesa inicial
    const acaoValue = system.acao?.value || 4;
    updates["system.defesa.value"] = 10 + acaoValue;
    updates["system.defesa.base"] = 10;
    updates["system.defesa.armadura"] = 0;
    updates["system.defesa.escudo"] = 0;
    updates["system.defesa.outros"] = 0;

    // Inicializar estruturas de recursos
    if (!system.recursos) {
      updates["system.recursos"] = {
        moedas: { cobre: 0, prata: 0, ouro: 0 },
        carga: { atual: 0, max: 40 }
      };
    }

    // Inicializar progressão
    if (!system.progressao) {
      updates["system.progressao"] = {
        pontosAtributo: 0,
        pontosHabilidade: 0
      };
    }

    // Inicializar nível e XP
    if (!system.nivel) {
      updates["system.nivel"] = {
        value: 1,
        xp: 0,
        xpProximo: 10
      };
    }

  } catch (error) {
    console.error("Clube dos Taberneiros | Erro na inicialização de valores:", error);
  }

  return updates;
}

// Hook simplificado para atualizações de ator
Hooks.on("updateActor", (actor, changes, options, userId) => {
  // Só calcular valores derivados se não foi explicitamente desabilitado
  if (actor.type === "personagem" && !options.skipDerivedCalculation) {
    // Usar setTimeout para evitar conflitos de timing
    setTimeout(() => {
      try {
        const updates = _calculateDerivedValues(actor.system, changes);
        
        if (Object.keys(updates).length > 0) {
          actor.update(updates, { skipDerivedCalculation: true });
        }
      } catch (error) {
        console.error("Clube dos Taberneiros | Erro nos cálculos derivados:", error);
      }
    }, 50); // Timeout muito menor
  }
});

// Hooks para quando itens são adicionados/removidos - com proteção
Hooks.on("createItem", (item, options, userId) => {
  if (item.parent && item.parent.type === "personagem" && !options.skipActorUpdate) {
    setTimeout(() => _updateActorFromItems(item.parent), 100);
  }
});

Hooks.on("updateItem", (item, changes, options, userId) => {
  if (item.parent && item.parent.type === "personagem" && !options.skipActorUpdate) {
    // Só atualizar se mudanças relevantes para equipamento
    const relevantChanges = ['equipado', 'defesa', 'peso', 'quantidade'];
    const hasRelevantChanges = relevantChanges.some(field => 
      changes.system && changes.system.hasOwnProperty(field)
    );
    
    if (hasRelevantChanges) {
      setTimeout(() => _updateActorFromItems(item.parent), 100);
    }
  }
});

Hooks.on("deleteItem", (item, options, userId) => {
  if (item.parent && item.parent.type === "personagem" && !options.skipActorUpdate) {
    setTimeout(() => _updateActorFromItems(item.parent), 100);
  }
});

/* -------------------------------------------- */
/*  Funções de Cálculo Aprimoradas              */
/* -------------------------------------------- */

function _calculateDerivedValues(system, changes = {}) {
  const updates = {};
  
  // SER ULTRA CONSERVADOR - só atualizar o que realmente mudou
  
  // Recalcular PV máximo APENAS se Físico mudou especificamente
  if (changes.system?.fisico?.value !== undefined) {
    const fisicoValue = parseInt(changes.system.fisico.value) || 4;
    const newPvMax = Math.max(1, fisicoValue * 3 + 10);
    
    // Só atualizar se realmente mudou
    if (system.pv?.max !== newPvMax) {
      updates["system.pv.max"] = newPvMax;
      
      // Ajustar PV atual apenas se necessário
      if (system.pv?.value > newPvMax) {
        updates["system.pv.value"] = newPvMax;
      }
    }
  }
  
  // Recalcular PM máximo APENAS se Mental mudou especificamente
  if (changes.system?.mental?.value !== undefined) {
    const mentalValue = parseInt(changes.system.mental.value) || 4;
    const newPmMax = Math.max(0, mentalValue * 2 + 5);
    
    // Só atualizar se realmente mudou
    if (system.pm?.max !== newPmMax) {
      updates["system.pm.max"] = newPmMax;
      
      // Ajustar PM atual apenas se necessário
      if (system.pm?.value > newPmMax) {
        updates["system.pm.value"] = newPmMax;
      }
    }
  }
  
  // Recalcular Defesa APENAS se Ação mudou especificamente
  if (changes.system?.acao?.value !== undefined) {
    const acaoValue = parseInt(changes.system.acao.value) || 4;
    const armaduraBonus = system.defesa?.armadura || 0;
    const escudoBonus = system.defesa?.escudo || 0;
    const outrosBonus = system.defesa?.outros || 0;
    const newDefesa = 10 + acaoValue + armaduraBonus + escudoBonus + outrosBonus;
    
    // Só atualizar se realmente mudou
    if (system.defesa?.value !== newDefesa) {
      updates["system.defesa.value"] = newDefesa;
    }
  }

  return updates;
}

function _updateActorFromItems(actor) {
  try {
    const updates = {};
    let armaduraDefesa = 0;
    let escudoDefesa = 0;
    let cargaAtual = 0;

    // Calcular bônus de equipamentos
    actor.items.forEach(item => {
      if (item.system.equipado) {
        if (item.type === "armadura") {
          armaduraDefesa += item.system.defesa || 0;
        } else if (item.type === "escudo") {
          escudoDefesa += item.system.defesa || 0;
        }
      }
      
      // Calcular carga total
      if (item.system.peso) {
        const quantidade = item.system.quantidade || 1;
        cargaAtual += item.system.peso * quantidade;
      }
    });

    // Só atualizar se realmente mudou
    if (actor.system.defesa?.armadura !== armaduraDefesa) {
      updates["system.defesa.armadura"] = armaduraDefesa;
    }
    
    if (actor.system.defesa?.escudo !== escudoDefesa) {
      updates["system.defesa.escudo"] = escudoDefesa;
    }
    
    const newDefesa = 10 + (actor.system.acao?.value || 4) + armaduraDefesa + escudoDefesa + (actor.system.defesa?.outros || 0);
    if (actor.system.defesa?.value !== newDefesa) {
      updates["system.defesa.value"] = newDefesa;
    }
    
    // Atualizar carga apenas se mudou significativamente
    const newCarga = Math.round(cargaAtual * 10) / 10;
    if (Math.abs((actor.system.recursos?.carga?.atual || 0) - newCarga) > 0.1) {
      updates["system.recursos.carga.atual"] = newCarga;
    }

    // Só fazer update se há mudanças reais
    if (Object.keys(updates).length > 0) {
      actor.update(updates, { skipDerivedCalculation: true });
    }

  } catch (error) {
    console.error("Clube dos Taberneiros | Erro na atualização por itens:", error);
  }
}

/* -------------------------------------------- */
/*  Sistema de Rolagem Aprimorado               */
/* -------------------------------------------- */

/**
 * Função principal para testes 2d6
 */
export async function rollTest(actor, attribute, skillBonus = 0, difficulty = 9, options = {}) {
  try {
    const attributeValue = actor.system[attribute]?.value || 0;
    const total = attributeValue + skillBonus;
    
    const rollFormula = "2d6 + @total";
    const roll = new Roll(rollFormula, { total });
    await roll.evaluate();
    
    const result = roll.total;
    const naturalRoll = roll.dice[0].results.reduce((sum, r) => sum + r.result, 0);
    
    // Determinar tipo de resultado
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
    } else if (result >= difficulty) {
      resultType = "success";
      resultClass = "success";
      resultText = "Sucesso";
    }
    
    // Criar mensagem de chat aprimorada
    const flavor = options.flavor || `Teste de ${attribute.charAt(0).toUpperCase() + attribute.slice(1)}`;
    const messageData = {
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: flavor,
      content: `
        <div class="cdt-roll-result ${resultClass}">
          <div class="cdt-roll-header">
            <h3>${flavor}</h3>
            <div class="cdt-roll-formula">2d6 + ${total} (${attribute} ${attributeValue}${skillBonus ? ` + ${skillBonus}` : ''})</div>
          </div>
          <div class="cdt-roll-body">
            <div class="cdt-dice-result">
              <span class="cdt-dice-total">${result}</span>
              <span class="cdt-natural-roll">(${naturalRoll} + ${total})</span>
            </div>
            <div class="cdt-difficulty">ND ${difficulty}</div>
            <div class="cdt-result ${resultClass}">
              <strong>${resultText}</strong>
              ${result >= difficulty ? `<span class="success-margin">Margem: ${result - difficulty}</span>` : `<span class="failure-margin">Faltou: ${difficulty - result}</span>`}
            </div>
          </div>
        </div>
      `,
      roll: roll,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL
    };

    // Aplicar efeitos especiais para críticos
    if (resultType === "criticalSuccess" && options.onCriticalSuccess) {
      options.onCriticalSuccess(actor, result);
    } else if (resultType === "criticalFailure" && options.onCriticalFailure) {
      options.onCriticalFailure(actor, result);
    }
    
    ChatMessage.create(messageData);
    return { roll, result, resultType, naturalRoll };
    
  } catch (error) {
    console.error("Clube dos Taberneiros | Erro na rolagem:", error);
    ui.notifications.error("Erro ao realizar rolagem");
    return null;
  }
}

/**
 * Rolagem de dano aprimorada
 */
export async function rollDamage(formula, actor, options = {}) {
  try {
    const roll = new Roll(formula);
    await roll.evaluate();
    
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
            <span class="cdt-damage-formula">${formula}</span>
          </div>
        </div>
      `,
      roll: roll,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL
    };
    
    ChatMessage.create(messageData);
    return roll;
    
  } catch (error) {
    console.error("Clube dos Taberneiros | Erro na rolagem de dano:", error);
    ui.notifications.error("Erro ao rolar dano");
    return null;
  }
}

/**
 * Rolagem de magia com gasto automático de PM
 */
export async function rollSpell(actor, spell, options = {}) {
  try {
    const custoMP = spell.system.custoMP || 1;
    const pmAtual = actor.system.pm?.value || 0;
    
    // Verificar se tem PM suficiente
    if (pmAtual < custoMP) {
      ui.notifications.warn(`PM insuficiente! Necessário: ${custoMP}, Atual: ${pmAtual}`);
      return null;
    }
    
    // Fazer teste de conjuração
    const difficulty = options.difficulty || (8 + spell.system.nivel);
    const rollResult = await rollTest(actor, "mental", 0, difficulty, {
      flavor: `Conjuração de ${spell.name}`,
      onCriticalSuccess: () => {
        ui.notifications.info("Conjuração crítica! Efeito potencializado!");
      },
      onCriticalFailure: () => {
        ui.notifications.warn("Falha crítica na conjuração! PM perdido!");
      }
    });
    
    if (rollResult) {
      // Gastar PM independente do resultado (pode ser configurado)
      const gastaPMSempre = game.settings.get("clube-dos-taberneiros", "gastaPMSempre") ?? true;
      
      if (rollResult.resultType === "success" || rollResult.resultType === "criticalSuccess" || gastaPMSempre) {
        await actor.update({
          "system.pm.value": Math.max(0, pmAtual - custoMP)
        });
        
        ui.notifications.info(`${custoMP} PM gastos. PM restante: ${pmAtual - custoMP}`);
      }
      
      // Adicionar informações da magia ao chat
      const spellInfo = `
        <div class="cdt-spell-info">
          <div><strong>Escola:</strong> ${game.i18n.localize(`CDT.${spell.system.escola.charAt(0).toUpperCase() + spell.system.escola.slice(1)}`)}</div>
          <div><strong>Nível:</strong> ${spell.system.nivel}</div>
          <div><strong>Alcance:</strong> ${spell.system.alcance}</div>
          <div><strong>Duração:</strong> ${spell.system.duracao}</div>
          ${spell.system.dano ? `<div><strong>Dano:</strong> ${spell.system.dano}</div>` : ''}
          <div class="cdt-spell-description">${spell.system.descricao}</div>
        </div>
      `;
      
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: spellInfo
      });
    }
    
    return rollResult;
    
  } catch (error) {
    console.error("Clube dos Taberneiros | Erro na conjuração:", error);
    ui.notifications.error("Erro ao conjurar magia");
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

// Configurar sistema para usar 2d6 para iniciativa
CONFIG.Combat.initiative = {
  formula: "2d6 + @attributes.acao.value",
  decimals: 0
};

// Configurar atributos de token
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

// Registrar configurações do sistema
Hooks.once("ready", () => {
  game.settings.register("clube-dos-taberneiros", "gastaPMSempre", {
    name: "Gastar PM Sempre",
    hint: "Se habilitado, PM é gasto mesmo quando a conjuração falha",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register("clube-dos-taberneiros", "mostrarFormulas", {
    name: "Mostrar Fórmulas de Rolagem",
    hint: "Exibe as fórmulas detalhadas nas rolagens",
    scope: "client",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register("clube-dos-taberneiros", "criarMacrosAuto", {
    name: "Criar Macros Automaticamente",
    hint: "Cria macros pré-definidas para testes rápidos",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  // Criar macros pré-definidas se habilitado
  if (game.settings.get("clube-dos-taberneiros", "criarMacrosAuto")) {
    _createPredefinedMacros();
  }
});

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

