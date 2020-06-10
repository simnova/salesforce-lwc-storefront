import { LightningElement, api } from 'lwc';

export default class ProductPriceListItem extends LightningElement {
    _pricebookEntry;
    _name;
    _isStandard;
    _unitPrice;

    @api
    get pricebookentry() {
        return this._product;
    }
    set pricebookentry(value) {
        this.pricebookEntry = value;
        this._name = value.Pricebook2.Name;
        this._isStandard = value.Pricebook2.IsStandard;
        this._unitPrice = value.UnitPrice;
    }
}