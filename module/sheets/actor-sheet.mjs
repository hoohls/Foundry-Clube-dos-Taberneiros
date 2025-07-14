import { rollTest, rollSpell, rollWeapon, rollDamage } from "../clube-dos-taberneiros.mjs";

export class TaberneiroPersonagemSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["clube-dos-taberneiros", "sheet", "actor"],
      template: "systems/clube-dos-taberneiros/templates/actor/personagem-sheet.html",
      width: 650,
      height: 650,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "principal" }],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
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
    context.escudos = this.actor.items.filter(item => item.type === "escudo");
    context.equipamentos = this.actor.items.filter(item => item.type === "equipamento");
    context.pocoes = this.actor.items.filter(item => item.type === "pocao");
    
    // Calcular informações adicionais
    context.statusHealth = this._getHealthStatus();
    context.encumbrance = this._getEncumbranceLevel();
    context.enrichedBiography = this._enrichHTML(context.system.detalhes?.biografia);
    
    // Verificar pré-requisitos de habilidades
    context.habilidades.forEach(habilidade => {
      habilidade.canUse = this._checkPrerequisites(habilidade);
    });
    
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
    
    // Listeners para rolagens aprimoradas
    html.find('.rollable').click(this._onRoll.bind(this));
    html.find('.attribute-roll').click(this._onAttributeRoll.bind(this));
    
    // Listeners para equipar/desequipar
    html.find('.item-toggle').change(this._onToggleEquip.bind(this));
    
    // Tooltips para atributos
    html.find('[data-tooltip]').hover(
      function() { $(this).addClass('cdt-tooltip'); },
      function() { $(this).removeClass('cdt-tooltip'); }
    );

    // Listener para drag & drop melhorado
    html.find('.item').on('dragstart', this._onDragStart.bind(this));
    
    // Listener para recursos rápidos
    html.find('.quick-rest').click(this._onQuickRest.bind(this));
    html.find('.long-rest').click(this._onLongRest.bind(this));
  }

  /**
   * Calcular status de saúde
   */
  _getHealthStatus() {
    const pv = this.actor.system.pv;
    const percentage = (pv.value / pv.max) * 100;
    
    if (percentage >= 75) return 'healthy';
    if (percentage >= 25) return 'wounded';
    return 'critical';
  }

  /**
   * Calcular nível de sobrecarga
   */
  _getEncumbranceLevel() {
    const carga = this.actor.system.recursos?.carga;
    if (!carga) return 'normal';
    
    const percentage = (carga.atual / carga.max) * 100;
    
    if (percentage >= 100) return 'over-encumbered';
    if (percentage >= 75) return 'heavily-loaded';
    if (percentage >= 50) return 'loaded';
    return 'normal';
  }

  /**
   * Enriquecer HTML com processamento de texto
   */
  async _enrichHTML(content) {
    if (!content) return '';
    return await TextEditor.enrichHTML(content, { async: true });
  }

  /**
   * Verificar pré-requisitos de habilidade
   */
  _checkPrerequisites(habilidade) {
    if (!habilidade.system.prerequisitos) return true;
    
    const prereqs = habilidade.system.prerequisitos.toLowerCase();
    const system = this.actor.system;
    
    // Verificar nível mínimo
    if (habilidade.system.nivelMinimo > system.nivel.value) {
      return false;
    }
    
    // Verificar atributos mínimos (exemplo: "fisico 6, mental 4")
    const attrMatches = prereqs.match(/(\w+)\s+(\d+)/g);
    if (attrMatches) {
      for (let match of attrMatches) {
        const [attr, min] = match.split(/\s+/);
        if (system[attr]?.value < parseInt(min)) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Criar um novo item
   */
  async _onCreateItem(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type;
    
    const itemData = {
      name: game.i18n.localize(`ITEM.Type${type.charAt(0).toUpperCase() + type.slice(1)}`),
      type: type,
      system: this._getDefaultItemData(type)
    };
    
    const newItem = await Item.create(itemData, { parent: this.actor });
    newItem.sheet.render(true);
  }

  /**
   * Obter dados padrão para novo item
   */
  _getDefaultItemData(type) {
    const defaults = {
      habilidade: {
        categoria: "geral",
        atributo: "fisico",
        bonus: 0,
        passiva: false
      },
      magia: {
        escola: "evocacao",
        nivel: 1,
        custoMP: 1,
        alcance: "toque",
        duracao: "instantaneo"
      },
      arma: {
        categoria: "corpo-a-corpo",
        tipo: "leve",
        dano: "1d6",
        alcance: "1.5m"
      },
      armadura: {
        categoria: "leve",
        defesa: 1,
        protecao: 0
      },
      equipamento: {
        categoria: "geral",
        quantidade: 1,
        peso: 0.1
      }
    };
    
    return defaults[type] || {};
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
   * Deletar um item com confirmação
   */
  async _onDeleteItem(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    
    const confirmed = await Dialog.confirm({
      title: game.i18n.localize("CDT.ConfirmDelete"),
      content: game.i18n.format("CDT.ConfirmDeleteItem", { name: item.name }),
      yes: () => true,
      no: () => false,
      defaultYes: false
    });
    
    if (confirmed) {
      await item.delete();
      ui.notifications.info(game.i18n.format("CDT.ItemDeleted", { name: item.name }));
    }
  }

  /**
   * Rolagem de atributo
   */
  async _onAttributeRoll(event) {
    event.preventDefault();
    const attribute = event.currentTarget.dataset.attribute;
    
    // Solicitar ND
    const difficulty = await this._promptForDifficulty();
    if (difficulty === null) return;
    
    await rollTest(this.actor, attribute, 0, difficulty, {
      flavor: `Teste de ${game.i18n.localize(`CDT.${attribute.charAt(0).toUpperCase() + attribute.slice(1)}`)}`
    });
  }

  /**
   * Fazer uma rolagem baseada no item
   */
  async _onRoll(event) {
    event.preventDefault();
    const itemId = event.currentTarget.dataset.itemId;
    const rollType = event.currentTarget.dataset.rollType;
    
    if (!itemId) return;
    
    const item = this.actor.items.get(itemId);
    if (!item) return;
    
    // Verificar pré-requisitos
    if (!this._checkPrerequisites(item)) {
      ui.notifications.warn(game.i18n.localize("CDT.PrerequisitesNotMet"));
      return;
    }
    
    // Implementar lógica de rolagem baseada no tipo
    switch (rollType || item.type) {
      case "habilidade":
        await this._rollSkill(item);
        break;
      case "magia":
      case "spell":
        await this._rollSpell(item);
        break;
      case "arma":
      case "weapon":
        await this._rollWeapon(item);
        break;
      case "pocao":
        await this._usePocao(item);
        break;
    }
  }

  /**
   * Rolagem de habilidade
   */
  async _rollSkill(item) {
    const difficulty = await this._promptForDifficulty();
    if (difficulty === null) return;
    
    const skillBonus = item.system.bonus || 0;
    const attribute = item.system.atributo || "fisico";
    
    await rollTest(this.actor, attribute, skillBonus, difficulty, {
      flavor: `${item.name}`,
      onCriticalSuccess: () => {
        ui.notifications.info(game.i18n.localize("CDT.SkillCriticalSuccess"));
      }
    });
  }

  /**
   * Rolagem de magia
   */
  async _rollSpell(item) {
    if (!item.system.custoMP) {
      ui.notifications.warn("Magia sem custo de PM definido!");
      return;
    }
    
    const options = {};
    
    // Solicitar ND se necessário
    if (item.system.nd) {
      options.difficulty = item.system.nd;
    }
    
    await rollSpell(this.actor, item, options);
  }

  /**
   * Rolagem de arma
   */
  async _rollWeapon(item) {
    // Verificar se está equipada
    if (!item.system.equipado) {
      ui.notifications.warn("Arma não está equipada!");
      return;
    }
    
    // Solicitar defesa do alvo
    const targetDefense = await this._promptForTargetDefense();
    if (targetDefense === null) return;
    
    await rollWeapon(this.actor, item, {
      targetDefense: targetDefense
    });
  }

  /**
   * Usar poção
   */
  async _usePocao(item) {
    const confirmed = await Dialog.confirm({
      title: game.i18n.localize("CDT.UsePocao"),
      content: game.i18n.format("CDT.ConfirmUsePocao", { name: item.name }),
      yes: () => true,
      no: () => false
    });
    
    if (!confirmed) return;
    
    // Aplicar efeito da poção
    await this._applyPocaoEffect(item);
    
    // Reduzir quantidade ou deletar
    if (item.system.quantidade > 1) {
      await item.update({ "system.quantidade": item.system.quantidade - 1 });
    } else {
      await item.delete();
    }
    
    ui.notifications.info(game.i18n.format("CDT.PocaoUsed", { name: item.name }));
  }

  /**
   * Aplicar efeito de poção
   */
  async _applyPocaoEffect(item) {
    const efeito = item.system.efeito;
    const system = this.actor.system;
    
    if (item.system.tipo === "cura" && item.system.recuperacao) {
      const roll = new Roll(item.system.recuperacao);
      await roll.evaluate();
      
      const newPV = Math.min(system.pv.max, system.pv.value + roll.total);
      await this.actor.update({ "system.pv.value": newPV });
      
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `Cura de ${item.name}`
      });
    }
    
    if (item.system.tipo === "PM" && item.system.recuperacao) {
      const roll = new Roll(item.system.recuperacao);
      await roll.evaluate();
      
      const newPM = Math.min(system.pm.max, system.pm.value + roll.total);
      await this.actor.update({ "system.pm.value": newPM });
      
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `Recuperação de PM de ${item.name}`
      });
    }
  }

  /**
   * Equipar/desequipar item
   */
  async _onToggleEquip(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    
    if (!item) return;
    
    const isEquipped = !item.system.equipado;
    
    // Verificar conflitos de equipamento
    if (isEquipped && !this._canEquipItem(item)) {
      ui.notifications.warn("Não é possível equipar este item!");
      event.currentTarget.checked = false;
      return;
    }
    
    await item.update({ "system.equipado": isEquipped });
  }

  /**
   * Verificar se pode equipar item
   */
  _canEquipItem(item) {
    // Verificar slots de equipamento (implementar lógica específica)
    return true;
  }

  /**
   * Solicitar ND do mestre
   */
  async _promptForDifficulty() {
    return new Promise((resolve) => {
      new Dialog({
        title: "Nível de Dificuldade",
        content: `
          <form>
            <div class="form-group">
              <label>ND:</label>
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
        `,
        buttons: {
          roll: {
            label: "Rolar",
            callback: (html) => resolve(parseInt(html.find('[name="difficulty"]').val()))
          },
          cancel: {
            label: "Cancelar",
            callback: () => resolve(null)
          }
        },
        default: "roll"
      }).render(true);
    });
  }

  /**
   * Solicitar defesa do alvo
   */
  async _promptForTargetDefense() {
    return new Promise((resolve) => {
      new Dialog({
        title: "Defesa do Alvo",
        content: `
          <form>
            <div class="form-group">
              <label>Defesa:</label>
              <input type="number" name="defense" value="10" min="5" max="25" />
            </div>
          </form>
        `,
        buttons: {
          attack: {
            label: "Atacar",
            callback: (html) => resolve(parseInt(html.find('[name="defense"]').val()))
          },
          cancel: {
            label: "Cancelar",
            callback: () => resolve(null)
          }
        },
        default: "attack"
      }).render(true);
    });
  }

  /**
   * Descanso rápido
   */
  async _onQuickRest(event) {
    event.preventDefault();
    
    const confirmed = await Dialog.confirm({
      title: "Descanso Rápido",
      content: "Recuperar metade dos PV e PM?",
      yes: () => true,
      no: () => false
    });
    
    if (confirmed) {
      const system = this.actor.system;
      const newPV = Math.min(system.pv.max, system.pv.value + Math.floor(system.pv.max / 2));
      const newPM = Math.min(system.pm.max, system.pm.value + Math.floor(system.pm.max / 2));
      
      await this.actor.update({
        "system.pv.value": newPV,
        "system.pm.value": newPM
      });
      
      ui.notifications.info("Descanso rápido realizado!");
    }
  }

  /**
   * Descanso longo
   */
  async _onLongRest(event) {
    event.preventDefault();
    
    const confirmed = await Dialog.confirm({
      title: "Descanso Longo",
      content: "Recuperar todos os PV e PM?",
      yes: () => true,
      no: () => false
    });
    
    if (confirmed) {
      const system = this.actor.system;
      
      await this.actor.update({
        "system.pv.value": system.pv.max,
        "system.pm.value": system.pm.max
      });
      
      ui.notifications.info("Descanso longo realizado!");
    }
  }

  /**
   * Melhorar drag start
   */
  _onDragStart(event) {
    const li = event.currentTarget;
    li.classList.add('dragging');
    
    // Remover classe após o drag
    setTimeout(() => {
      li.classList.remove('dragging');
    }, 100);
    
    return super._onDragStart(event);
  }

  /** @override */
  _canDragStart(selector) {
    return this.actor.isOwner;
  }

  /** @override */
  _canDragDrop(selector) {
    return this.actor.isOwner;
  }
} 