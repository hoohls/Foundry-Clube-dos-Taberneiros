export class ClubeActor extends Actor {
  /** @override */
  prepareData() {
    super.prepareData();
    
    // Calcular valores derivados
    this._calculateDerivedValues();
  }

  /**
   * Calcular valores derivados como PV, PM e Defesa
   */
  _calculateDerivedValues() {
    if (this.type === "personagem") {
      const system = this.system;
      
      // Calcular PV máximo se não estiver definido
      if (!system.pv?.max && system.fisico?.value) {
        system.pv = system.pv || {};
        system.pv.max = system.fisico.value * 3 + 10;
      }
      
      // Calcular PM máximo se não estiver definido
      if (!system.pm?.max && system.mental?.value) {
        system.pm = system.pm || {};
        system.pm.max = system.mental.value * 2 + 5;
      }
      
      // Calcular Defesa
      if (system.acao?.value) {
        system.defesa = system.defesa || {};
        system.defesa.value = 10 + system.acao.value + 
          (system.defesa.armadura || 0) + (system.defesa.escudo || 0);
      }
      
      // Inicializar recursos se não existirem
      if (!system.recursos) {
        system.recursos = {
          moedas: {
            cobre: 0,
            prata: 0,
            ouro: 0
          }
        };
      }
      
      // Inicializar detalhes se não existirem
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