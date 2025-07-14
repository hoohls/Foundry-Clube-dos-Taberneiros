export class ClubeActor extends Actor {
  /** @override */
  prepareData() {
    super.prepareData();
    
    // Preparação mínima - apenas garantir estruturas básicas
    this._ensureBasicStructures();
  }

  /**
   * Garantir estruturas básicas apenas (não calcular valores derivados)
   */
  _ensureBasicStructures() {
    if (this.type === "personagem") {
      const system = this.system;
      
      // Apenas garantir que estruturas existem - NÃO calcular valores
      if (!system.pv) {
        system.pv = { value: 10, max: 10 };
      }
      
      if (!system.pm) {
        system.pm = { value: 5, max: 5 };
      }
      
      if (!system.defesa) {
        system.defesa = { 
          value: 10, 
          base: 10, 
          armadura: 0, 
          escudo: 0, 
          outros: 0 
        };
      }
      
      if (!system.recursos) {
        system.recursos = {
          moedas: { cobre: 0, prata: 0, ouro: 0 },
          carga: { atual: 0, max: 40 }
        };
      }
      
      if (!system.detalhes) {
        system.detalhes = {
          aparencia: "",
          personalidade: "",
          historia: "",
          biografia: ""
        };
      }
    }
  }

  /**
   * Fazer um teste de atributo
   */
  async rollAttribute(attributeName, options = {}) {
    const attribute = this.system[attributeName];
    if (!attribute) {
      ui.notifications.error(`Atributo ${attributeName} não encontrado`);
      return;
    }

    const formula = "2d6 + @attr";
    const roll = new Roll(formula, {
      attr: attribute.value || 0
    });

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `Teste de ${attributeName}`
    });

    return roll;
  }

  /**
   * Fazer um teste de habilidade
   */
  async rollSkill(skillId, options = {}) {
    const skill = this.items.get(skillId);
    if (!skill || skill.type !== "habilidade") {
      ui.notifications.error("Habilidade não encontrada");
      return;
    }

    const attribute = this.system[skill.system.atributo];
    const formula = "2d6 + @attr + @bonus";
    const roll = new Roll(formula, {
      attr: attribute?.value || 0,
      bonus: skill.system.bonus || 0
    });

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `Teste de ${skill.name}`
    });

    return roll;
  }
} 