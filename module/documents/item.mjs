export class ClubeItem extends Item {
  /** @override */
  prepareData() {
    super.prepareData();
    
    // Inicializar dados padrão baseado no tipo
    this._initializeDefaultData();
  }

  /**
   * Inicializar dados padrão baseado no tipo do item
   */
  _initializeDefaultData() {
    const system = this.system;
    
    // Dados padrão para todos os itens
    if (!system.preco) {
      system.preco = {
        valor: 0,
        moeda: "MP"
      };
    }
    
    if (system.peso === undefined) {
      system.peso = 0;
    }
    
    if (!system.raridade) {
      system.raridade = "comum";
    }
    
    if (!system.nivelMinimo) {
      system.nivelMinimo = 1;
    }

    // Dados específicos por tipo
    switch (this.type) {
      case "habilidade":
        if (!system.categoria) system.categoria = "gerais";
        if (!system.atributo) system.atributo = "fisico";
        if (system.bonus === undefined) system.bonus = 0;
        if (system.passiva === undefined) system.passiva = false;
        break;
        
      case "magia":
        if (!system.escola) system.escola = "evocacao";
        if (!system.nivel) system.nivel = 1;
        if (!system.custoMP) system.custoMP = 1;
        if (!system.alcance) system.alcance = "Pessoal";
        if (!system.duracao) system.duracao = "Instantâneo";
        if (!system.componentes) {
          system.componentes = {
            verbal: true,
            somatico: true,
            material: false,
            materialDescricao: ""
          };
        }
        break;
        
      case "arma":
        if (!system.categoria) system.categoria = "corpo-a-corpo";
        if (!system.tipo) system.tipo = "leve";
        if (!system.dano) system.dano = "1d4";
        if (!system.alcance) system.alcance = "1.5m";
        if (!system.propriedades) system.propriedades = [];
        if (system.municao === undefined) system.municao = 0;
        if (system.municaoMax === undefined) system.municaoMax = 0;
        if (system.equipado === undefined) system.equipado = false;
        break;
        
      case "armadura":
        if (!system.tipo) system.tipo = "leve";
        if (system.defesa === undefined) system.defesa = 0;
        if (system.penalidades === undefined) system.penalidades = 0;
        if (system.furtividade === undefined) system.furtividade = false;
        if (system.equipado === undefined) system.equipado = false;
        break;
        
      case "equipamento":
        if (system.quantidade === undefined) system.quantidade = 1;
        if (system.consumivel === undefined) system.consumivel = false;
        break;
    }
  }

  /**
   * Verificar se o item pode ser usado pelo ator
   */
  canUse(actor) {
    if (!actor) return false;
    
    // Verificar nível mínimo
    if (actor.system.nivel?.value < this.system.nivelMinimo) {
      return false;
    }
    
    // Verificações específicas por tipo
    switch (this.type) {
      case "magia":
        // Verificar se o ator tem PM suficiente
        if (actor.system.pm?.value < this.system.custoMP) {
          return false;
        }
        break;
        
      case "arma":
      case "armadura":
        // Verificar se o ator tem proficiência (implementar lógica específica)
        break;
    }
    
    return true;
  }

  /**
   * Usar o item
   */
  async use(actor, options = {}) {
    if (!this.canUse(actor)) {
      ui.notifications.error("Não é possível usar este item");
      return;
    }

    switch (this.type) {
      case "magia":
        await this._castSpell(actor, options);
        break;
        
      case "equipamento":
        await this._useEquipment(actor, options);
        break;
        
      default:
        ui.notifications.info(`Usando ${this.name}`);
    }
  }

  /**
   * Conjurar magia
   */
  async _castSpell(actor, options) {
    // Verificar PM
    if (actor.system.pm.value < this.system.custoMP) {
      ui.notifications.error("Pontos de magia insuficientes");
      return;
    }

    // Fazer rolagem de conjuração
    const formula = "2d6 + @attr";
    const roll = new Roll(formula, {
      attr: actor.system.mental?.value || 0
    });

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `Conjuração de ${this.name}`
    });

    // Se bem-sucedido, gastar PM
    if (roll.total >= (this.system.nd || 6)) {
      await actor.update({
        "system.pm.value": actor.system.pm.value - this.system.custoMP
      });
      
      ui.notifications.success(`${this.name} conjurada com sucesso!`);
    } else {
      ui.notifications.warn("Falha na conjuração da magia");
    }
  }

  /**
   * Usar equipamento
   */
  async _useEquipment(actor, options) {
    if (this.system.consumivel) {
      // Decrementar quantidade
      const newQuantity = this.system.quantidade - 1;
      if (newQuantity <= 0) {
        await this.delete();
        ui.notifications.info(`${this.name} foi consumido`);
      } else {
        await this.update({ "system.quantidade": newQuantity });
        ui.notifications.info(`Usando ${this.name} (${newQuantity} restantes)`);
      }
    } else {
      ui.notifications.info(`Usando ${this.name}`);
    }
  }
} 