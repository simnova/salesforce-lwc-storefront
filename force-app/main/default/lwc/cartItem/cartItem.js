import { LightningElement, api , track} from 'lwc';

export default class CartItem extends LightningElement {

    _orderItem;
    /** Line Item to display. */
    @api
    get orderItem() {
        return this._orderItem;
    }
    set orderItem(value) {
        this._orderItem = value;
    }

    handleClick() {
        const removedEvent = new CustomEvent('removed', {
            detail: this._orderItem.Id
        });
        this.dispatchEvent(removedEvent);
    }
}