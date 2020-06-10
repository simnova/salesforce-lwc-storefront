import { LightningElement, api } from 'lwc';
import { determinePrice } from 'c/priceManager';


export default class ProductListItem extends LightningElement {

    _product;
    _price = 0;
    /** Product__c to display. */
    @api
    get product() {
        return this._product;
    }
    set product(value) {
        this._product = value;
        this._price = determinePrice(value); 
    }

    @api
    get price() {
        return this._price;
    }

    handleClick() {
        const selectedEvent = new CustomEvent('selected', {
            detail: this.product
        });
        console.log('handleClick');
        this.dispatchEvent(selectedEvent);
    }

}