import { LightningElement, api , track} from 'lwc';

export default class CartItem extends LightningElement {

    _lineItem;
    /** Line Item to display. */
    @api
    get lineItem() {
        return this._lineItem;
    }
    set lineItem(value) {
        this._lineItem = value;
    }

    handleClick() {
        const removedEvent = new CustomEvent('removed', {
            detail: this._lineItem.product.Id
        });
        this.dispatchEvent(removedEvent);
    }
}