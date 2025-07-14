export class TaberneiroPersonagemSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["clube-dos-taberneiros", "sheet", "actor"],
      template: "systems/clube-dos-taberneiros/templates/actor/personagem-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "principal" }]
    });
  }

  /** @override */
  getData() {
    const context = super.getData();
    
    // Organizar itens por tipo
    context.habilidades = this.actor.items.filter(item => item.type === "habilidade");
    context.magias = this.actor.items.filter(item => item.type === "magia");
    context.armas = this.actor.items.filter(item => item.type === "arma");
    context.armaduras = this.actor.items.filter(item => item.type === "armadura");
    context.equipamentos = this.actor.items.filter(item => item.type === "equipamento");
    
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Listeners para criação de itens
    html.find('.item-control[data-action="create"]').click(this._onCreateItem.bind(this));
    
    // Listeners para edição e deleção de itens
    html.find('.item-control[data-action="edit"]').click(this._onEditItem.bind(this));
    html.find('.item-control[data-action="delete"]').click(this._onDeleteItem.bind(this));
    
    // Listeners para rolagens
    html.find('.rollable').click(this._onRoll.bind(this));
  }

  /**
   * Criar um novo item
   */
  async _onCreateItem(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type;
    const itemData = {
      name: `Nova ${type}`,
      type: type,
      system: {}
    };
    
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Editar um item
   */
  _onEditItem(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    item.sheet.render(true);
  }

  /**
   * Deletar um item
   */
  async _onDeleteItem(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    
    const confirmed = await Dialog.confirm({
      title: "Confirmar Deleção",
      content: `Tem certeza que deseja deletar "${item.name}"?`,
      yes: () => true,
      no: () => false
    });
    
    if (confirmed) {
      await item.delete();
    }
  }

  /**
   * Fazer uma rolagem
   */
  _onRoll(event) {
    event.preventDefault();
    const itemId = event.currentTarget.dataset.itemId;
    const rollType = event.currentTarget.dataset.rollType;
    const item = this.actor.items.get(itemId);
    
    if (!item) return;
    
    // Implementar lógica de rolagem baseada no tipo
    switch (rollType) {
      case "item":
        this._rollItem(item);
        break;
      case "spell":
        this._rollSpell(item);
        break;
      case "weapon":
        this._rollWeapon(item);
        break;
    }
  }

  /**
   * Rolagem de habilidade
   */
  _rollItem(item) {
    const formula = `2d6 + @attr + @bonus`;
    const roll = new Roll(formula, {
      attr: this.actor.system[item.system.atributo]?.value || 0,
      bonus: item.system.bonus || 0
    });
    
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `Teste de ${item.name}`
    });
  }

  /**
   * Rolagem de magia
   */
  _rollSpell(item) {
    const formula = `2d6 + @attr`;
    const roll = new Roll(formula, {
      attr: this.actor.system.mental?.value || 0
    });
    
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `Conjuração de ${item.name}`
    });
  }

  /**
   * Rolagem de arma
   */
  _rollWeapon(item) {
    const formula = `2d6 + @attr`;
    const roll = new Roll(formula, {
      attr: this.actor.system.acao?.value || 0
    });
    
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `Ataque com ${item.name}`
    });
  }
} 