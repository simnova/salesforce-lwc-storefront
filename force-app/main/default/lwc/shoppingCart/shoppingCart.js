import { LightningElement, wire, track } from 'lwc';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import { determinePrice } from 'c/priceManager';

export default class ShoppingCart extends LightningElement {
  
    lineItemData = new Map();
    lineItems = [];
    grandTotal = 0;
    /*
    get lineItems() {
        return this._lineItems;
    }
*/

    @wire(CurrentPageReference) pageRef;

    handleProductSelected(product){
        console.log('receiving event');
        console.log(product);
        try {
            var key = product.Id
            var value;
            if (this.lineItemData.has(key)){
                value = this.lineItemData.get(key);
            }else {
                value = {quantity:0, product:product};
            }
            value.quantity++;
            value.price =  determinePrice(product); // product.PricebookEntries[0].UnitPrice;
            value.total = value.quantity * value.price;
            value.key = `${key}-${value.quantity}`;
            this.lineItemData.set(key,value); 
            this.lineItems = Array.from(this.lineItemData.values()); //need to be array for LWC
            this.grandTotal = this.lineItems.reduce((accumlator,lineItem) =>  lineItem.total + accumlator,0);
        } catch (error) {
            console.error("error when adding item",error);
        }
        console.log(`size:${this.lineItemData.size}`);
        
    }

    handleProductRemoved(event) {
        console.log('firing removed event', event);
        
        try {
            var key = event.detail
            var value;
            if (this.lineItemData.has(key)){
                value = this.lineItemData.get(key);
            }else {
                return;
            }
            value.quantity--;
        
            value.price = determinePrice(value.product); ///  value.product.PricebookEntries[0].UnitPrice;
            value.total = value.quantity * value.price;
            value.key = `${key}-${value.quantity}`;
            this.lineItemData.set(key,value); 
            if(value.quantity === 0){
                this.lineItemData.delete(key);
            }
            
            this.lineItems = Array.from(this.lineItemData.values()); //need to be array for LWC
            this.grandTotal = this.lineItems.reduce((accumlator,lineItem) =>  lineItem.total + accumlator,0);
        } catch (error) {
            console.error("error when adding item",error);
        }


        fireEvent(this.pageRef, 'productSelected', event.detail);
    }

    //LWC Lifecycle Hooks

    connectedCallback() {
        console.log('registered and connected');
        registerListener('productSelected', this.handleProductSelected, this);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    
}