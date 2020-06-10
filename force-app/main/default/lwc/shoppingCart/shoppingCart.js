import { LightningElement, wire, track } from 'lwc';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import { determinePrice } from 'c/priceManager';
import getOrderDetails from '@salesforce/apex/OrderController.getOrderDetails';

export default class ShoppingCart extends LightningElement {
  
    lineItemData = new Map();
    lineItems = [];
    grandTotal = 0;
    _order = {};
    /*
    get lineItems() {
        return this._lineItems;
    }
*/

    @wire(CurrentPageReference) pageRef;

    handleOrderSelected(orderId){
        try {
            getOrderDetails(orderId)
                .then(orders => {
                    console.log('Order Lookup: Success!')
                    console.log(orders);
                    this._order = orders[0];
                })
                .catch(error => {
                    console.error(`Error encountered when looking up Order Details`, error)
                })
        } catch(error) {
            console.error(`Error encountered when looking up Order Details`, error)
        }
    }

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
        registerListener('orderSelected', this.handleOrderSelected, this);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    
}