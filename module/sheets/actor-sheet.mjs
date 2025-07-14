import { rollTest, rollSpell, rollWeapon, rollDamage } from "../clube-dos-taberneiros.mjs";

export class TaberneiroPersonagemSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["clube-dos-taberneiros", "sheet", "actor"],
      template: "systems/clube-dos-taberneiros/templates/actor/personagem-sheet.hbs",
      width: 650,
      height: 650,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "principal" }],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
    });
  }

  /** @override */
  getData() {
    // Usar método padrão do Foundry
    const context = super.getData();
    const actorData = this.actor.toObject(false);
    
    // Adicionar dados do sistema
    context.system = actorData.system;
    context.flags = actorData.flags;
    
    // Organizar itens por tipo de forma segura
    const items = this.actor.items;
    context.habilidades = items.filter(item => item.type === "habilidade") || [];
    context.magias = items.filter(item => item.type === "magia") || [];
    context.armas = items.filter(item => item.type === "arma") || [];
    context.armaduras = items.filter(item => item.type === "armadura") || [];
    context.escudos = items.filter(item => item.type === "escudo") || [];
    context.equipamentos = items.filter(item => item.type === "equipamento") || [];
    context.pocoes = items.filter(item => item.type === "pocao") || [];
    
    // Adicionar informações de status de forma segura
    try {
      context.statusHealth = this._getHealthStatus();
      context.encumbrance = this._getEncumbranceLevel();
      
      // Verificar pré-requisitos de habilidades de forma segura
      context.habilidades.forEach(habilidade => {
        try {
          habilidade.canUse = this._checkPrerequisites(habilidade);
        } catch (error) {
          console.warn("Erro ao verificar pré-requisitos:", error);
          habilidade.canUse = true; // Padrão seguro
        }
      });
      
      // Enriquecer biografia de forma segura
      if (context.system.detalhes?.biografia) {
        context.enrichedBiography = TextEditor.enrichHTML(context.system.detalhes.biografia, {async: false});
      } else {
        context.enrichedBiography = "";
      }
      
    } catch (error) {
      console.error("Clube dos Taberneiros | Erro em getData():", error);
      // Valores padrão seguros
      context.statusHealth = "healthy";
      context.encumbrance = "normal";
      context.enrichedBiography = "";
    }
    
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Não editar se a ficha estiver bloqueada
    if (!this.isEditable) return;

    // Listeners para criação de itens
    html.find('.item-control[data-action="create"]').click(this._onCreateItem.bind(this));
    
    // Listeners para edição e deleção de itens
    html.find('.item-control[data-action="edit"]').click(this._onEditItem.bind(this));
    html.find('.item-control[data-action="delete"]').click(this._onDeleteItem.bind(this));
    
    // Listeners para equipar/desequipar
    html.find('.item-toggle').change(this._onToggleEquip.bind(this));
    
    // Listeners para rolagens
    html.find('.attribute-roll').click(this._onAttributeRoll.bind(this));
    html.find('.rollable').click(this._onRollItem.bind(this));
    
    // Listeners para descanso
    html.find('.quick-rest').click(this._onQuickRest.bind(this));
    html.find('.long-rest').click(this._onLongRest.bind(this));
    
    // Tooltips
    this._initializeTooltips(html);
  }

  /**
   * Inicializar tooltips
   */
  _initializeTooltips(html) {
    try {
      html.find('.cdt-tooltip').each((i, element) => {
        const tooltip = $(element).attr('data-tooltip');
        if (tooltip) {
          $(element).attr('title', tooltip);
        }
      });
    } catch (error) {
      console.warn("Clube dos Taberneiros | Erro ao inicializar tooltips:", error);
    }
  }

  /**
   * Obter status de saúde
   */
  _getHealthStatus() {
    try {
      const pv = this.actor.system.pv;
      if (!pv || !pv.max) return "healthy";
      
      const percentage = (pv.value / pv.max) * 100;
      
      if (percentage <= 0) return "dead";
      if (percentage <= 25) return "bloodied";
      if (percentage <= 50) return "wounded";
      return "healthy";
    } catch (error) {
      console.warn("Erro ao calcular status de saúde:", error);
      return "healthy";
    }
  }

  /**
   * Obter nível de sobrecarga
   */
  _getEncumbranceLevel() {
    try {
      const carga = this.actor.system.recursos?.carga;
      if (!carga) return "normal";
      
      const percentage = (carga.atual / carga.max) * 100;
      
      if (percentage >= 100) return "over-encumbered";
      if (percentage >= 75) return "heavily-loaded";
      return "normal";
    } catch (error) {
      console.warn("Erro ao calcular sobrecarga:", error);
      return "normal";
    }
  }

  /**
   * Verificar pré-requisitos
   */
  _checkPrerequisites(habilidade) {
    try {
      // Implementação simplificada - sempre retorna true por segurança
      return true;
    } catch (error) {
      console.warn("Erro ao verificar pré-requisitos:", error);
      return true;
    }
  }

  /**
   * Criar novo item
   */
  async _onCreateItem(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    
    const itemData = {
      name: `Novo ${type}`,
      type: type,
      system: {}
    };
    
    // Dados específicos por tipo
    switch (type) {
      case "habilidade":
        itemData.system = { atributo: "fisico", bonus: 0, categoria: "geral" };
        break;
      case "magia":
        itemData.system = { escola: "evocacao", nivel: 1, custoMP: 1 };
        break;
      case "arma":
        itemData.system = { categoria: "simples", tipo: "corpo-a-corpo", dano: "1d6" };
        break;
      case "armadura":
        itemData.system = { categoria: "leve", defesa: 1 };
        break;
      case "equipamento":
        itemData.system = { categoria: "aventura", quantidade: 1 };
        break;
    }
    
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Editar item
   */
  _onEditItem(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("item-id"));
    item.sheet.render(true);
  }

  /**
   * Deletar item
   */
  async _onDeleteItem(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("item-id"));
    
    return Dialog.confirm({
      title: "Deletar Item",
      content: `<p>Tem certeza que deseja deletar <strong>${item.name}</strong>?</p>`,
      yes: () => item.delete(),
      no: () => {},
      defaultYes: false
    });
  }

  /**
   * Equipar/Desequipar item
   */
  async _onToggleEquip(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("item-id"));
    const isEquipped = event.currentTarget.checked;
    
    return item.update({"system.equipado": isEquipped});
  }

  /**
   * Rolar atributo
   */
  async _onAttributeRoll(event) {
    event.preventDefault();
    const attribute = event.currentTarget.dataset.attribute;
    
    try {
      await rollTest({
        actor: this.actor,
        attribute: attribute,
        difficulty: 9 // ND padrão
      });
    } catch (error) {
      console.error("Erro na rolagem de atributo:", error);
    }
  }

  /**
   * Rolar item
   */
  async _onRollItem(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("item-id"));
    const rollType = event.currentTarget.dataset.rollType;
    
    try {
      switch (rollType) {
        case "habilidade":
          await rollTest({
            actor: this.actor,
            attribute: item.system.atributo,
            bonus: item.system.bonus,
            skillName: item.name,
            difficulty: 9
          });
          break;
        case "magia":
          await rollSpell(this.actor, item);
          break;
        case "arma":
          await rollWeapon(this.actor, item);
          break;
        case "pocao":
          await this._usePotion(item);
          break;
      }
    } catch (error) {
      console.error("Erro na rolagem de item:", error);
    }
  }

  /**
   * Descanso rápido
   */
  async _onQuickRest(event) {
    event.preventDefault();
    
    try {
      const system = this.actor.system;
      const updates = {
        "system.pv.value": Math.min(system.pv.max, system.pv.value + Math.floor(system.pv.max / 2)),
        "system.pm.value": Math.min(system.pm.max, system.pm.value + Math.floor(system.pm.max / 2))
      };
      
      await this.actor.update(updates);
      
      ChatMessage.create({
        content: `<p><strong>${this.actor.name}</strong> fez um descanso rápido e recuperou recursos!</p>`,
        speaker: ChatMessage.getSpeaker({actor: this.actor})
      });
    } catch (error) {
      console.error("Erro no descanso rápido:", error);
    }
  }

  /**
   * Descanso longo
   */
  async _onLongRest(event) {
    event.preventDefault();
    
    try {
      const system = this.actor.system;
      const updates = {
        "system.pv.value": system.pv.max,
        "system.pm.value": system.pm.max
      };
      
      await this.actor.update(updates);
      
      ChatMessage.create({
        content: `<p><strong>${this.actor.name}</strong> fez um descanso longo e recuperou todos os recursos!</p>`,
        speaker: ChatMessage.getSpeaker({actor: this.actor})
      });
    } catch (error) {
      console.error("Erro no descanso longo:", error);
    }
  }

  /**
   * Usar poção
   */
  async _usePotion(item) {
    try {
      if (item.system.quantidade <= 0) {
        ui.notifications.warn("Não há mais unidades desta poção!");
        return;
      }
      
      // Reduzir quantidade
      await item.update({"system.quantidade": item.system.quantidade - 1});
      
      ChatMessage.create({
        content: `<p><strong>${this.actor.name}</strong> usou ${item.name}!</p><p>${item.system.efeito || "Efeito a ser determinado pelo Mestre."}</p>`,
        speaker: ChatMessage.getSpeaker({actor: this.actor})
      });
    } catch (error) {
      console.error("Erro ao usar poção:", error);
    }
  }

  /** @override */
  async _updateObject(event, formData) {
    try {
      // Usar método padrão do Foundry
      return super._updateObject(event, formData);
    } catch (error) {
      console.error("Clube dos Taberneiros | Erro ao atualizar ator:", error);
      throw error;
    }
  }
} 