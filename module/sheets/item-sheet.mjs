export class ClubeItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["clube-dos-taberneiros", "sheet", "item"],
      template: "systems/clube-dos-taberneiros/templates/item/item-sheet.html",
      width: 500,
      height: 400
    });
  }

  /** @override */
  getData() {
    const context = super.getData();
    context.itemType = this.item.type;
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    
    // Adicionar listeners específicos se necessário
    html.find('input[name="system.componentes.material"]').change(this._onMaterialToggle.bind(this));
  }

  /**
   * Toggle para mostrar/ocultar campo de componente material
   */
  _onMaterialToggle(event) {
    const isChecked = event.target.checked;
    const materialDescField = this.form.querySelector('input[name="system.componentes.materialDescricao"]');
    
    if (materialDescField) {
      materialDescField.style.display = isChecked ? 'block' : 'none';
    }
  }
} 