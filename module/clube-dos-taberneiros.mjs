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

  console.log('Clube dos Taberneiros | Helpers do Handlebars registrados');
}

/* -------------------------------------------- */
/*  Hooks de Sistema                            */
/* -------------------------------------------- */

// Hook para quando um ator é criado
Hooks.on("createActor", (actor, options, userId) => {
  if (actor.type === "personagem") {
    // Calcular valores derivados iniciais
    actor.update({
      "system.pv.max": actor.system.fisico.value * 3 + 10,
      "system.pv.value": actor.system.fisico.value * 3 + 10,
      "system.pm.max": actor.system.mental.value * 2 + 5,
      "system.pm.value": actor.system.mental.value * 2 + 5,
      "system.defesa.value": 10 + actor.system.acao.value
    });
  }
});

// Hook para quando dados de ator são atualizados
Hooks.on("updateActor", (actor, changes, options, userId) => {
  if (actor.type === "personagem" && !options.skipDerivedCalculation) {
    const updates = {};
    
    // Recalcular PV máximo se Físico mudou
    if (changes.system?.fisico?.value) {
      updates["system.pv.max"] = changes.system.fisico.value * 3 + 10;
    }
    
    // Recalcular PM máximo se Mental mudou
    if (changes.system?.mental?.value) {
      updates["system.pm.max"] = changes.system.mental.value * 2 + 5;
    }
    
    // Recalcular Defesa se Ação mudou
    if (changes.system?.acao?.value) {
      updates["system.defesa.value"] = 10 + changes.system.acao.value + 
        (actor.system.defesa.armadura || 0) + (actor.system.defesa.escudo || 0);
    }
    
    if (Object.keys(updates).length > 0) {
      actor.update(updates, { skipDerivedCalculation: true });
    }
  }
});

/* -------------------------------------------- */
/*  Funções de Rolagem                          */
/* -------------------------------------------- */

// Função para rolar 2d6 + modificador
export function rollTest(actor, attribute, skill = 0, difficulty = 9) {
  const roll = new Roll("2d6 + @attr + @skill", {
    attr: actor.system[attribute]?.value || 0,
    skill: skill
  });
  
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({actor}),
    flavor: `Teste de ${attribute.charAt(0).toUpperCase() + attribute.slice(1)} (ND ${difficulty})`
  });
  
  return roll;
}

// Função para rolar dano
export function rollDamage(formula, actor) {
  const roll = new Roll(formula);
  
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({actor}),
    flavor: "Dano"
  });
  
  return roll;
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

