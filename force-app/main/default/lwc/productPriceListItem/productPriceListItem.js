import { LightningElement, api, wire } from 'lwc';
import { fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

export default class ProductPriceListItem extends LightningElement {
    _pricebookEntry;
    _name;
    _isStandard;
    _unitPrice;
    _id;
    _productId;
    _pricebookId;

    @wire(CurrentPageReference) pageRef;

    @api
    get pricebookentry() {
        return this._product;
    }
    set pricebookentry(value) {
        this._id = value.Id;
        this._productId = value.Product2.Id
        this.pricebookEntry = value;
        this._name = value.Pricebook2.Name;
        this._isStandard = value.Pricebook2.IsStandard;
        this._pricebookId = value.Pricebook2.Id;
        this._unitPrice = value.UnitPrice;
    }

    handleClick() {
        fireEvent(this.pageRef, 'pricebookEntrySelected', {
            pricebookEntryId: this._id,
            productId: this._productId,
            price: this._unitPrice,
            pricebookId: this._pricebookId
        });
    }
}