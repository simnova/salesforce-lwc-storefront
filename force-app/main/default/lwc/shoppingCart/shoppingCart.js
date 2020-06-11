import { LightningElement, wire, track, api } from 'lwc';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import { determinePrice } from 'c/priceManager';
import getOrderDetails from '@salesforce/apex/OrderController.getOrderDetails';

import { createRecord, updateRecord, deleteRecord } from 'lightning/uiRecordApi';

//Order Schema
import ORDER_OBJECT from '@salesforce/schema/Order';
import ORDER_ID from '@salesforce/schema/Order.Id';
import ORDER_PRICEBOOK2_ID from '@salesforce/schema/Order.Pricebook2Id';


//Order Product Schema
import ORDER_ITEM_OBJECT from '@salesforce/schema/OrderItem';
import ORDER_ITEM_ID from '@salesforce/schema/OrderItem.Id';
import ORDER_ITEM_AVAILABLE_QUANTITY from '@salesforce/schema/OrderItem.AvailableQuantity';
import ORDER_ITEM_CREATED_BY_ID from '@salesforce/schema/OrderItem.CreatedById';
import ORDER_ITEM_END_DATE from '@salesforce/schema/OrderItem.EndDate';
import ORDER_ITEM_LAST_MODIFIED_BY_ID from '@salesforce/schema/OrderItem.LastModifiedById';
import ORDER_ITEM_DESCRIPTION from '@salesforce/schema/OrderItem.Description';
import ORDER_ITEM_LIST_PRICE from '@salesforce/schema/OrderItem.ListPrice';
import ORDER_ITEM_ORDER_ID from '@salesforce/schema/OrderItem.OrderId';
import ORDER_ITEM_ORDER_ITEM_NUMBER from '@salesforce/schema/OrderItem.OrderItemNumber';
import ORDER_ITEM_ORIGINAL_ORDER_ITEM_ID from '@salesforce/schema/OrderItem.OriginalOrderItemId';
import ORDER_ITEM_PRODUCT2_ID from '@salesforce/schema/OrderItem.Product2Id';
import ORDER_ITEM_QUANTITY from '@salesforce/schema/OrderItem.Quantity';
import ORDER_ITEM_SERVICE_DATE from '@salesforce/schema/OrderItem.ServiceDate';
import ORDER_ITEM_TOTAL_PRICE from '@salesforce/schema/OrderItem.TotalPrice';
import ORDER_ITEM_UNIT_PRICE from '@salesforce/schema/OrderItem.UnitPrice';

import ORDER_ITEM_PRICEBOOK_ENTRY_ID from '@salesforce/schema/OrderItem.PricebookEntryId';



export default class ShoppingCart extends LightningElement {
  
    lineItemData = new Map();
    lineItems = [];
    grandTotal = 0;

    _order = {};

    
    get order(){
        return this._order;
    }
    /*
    get lineItems() {
        return this._lineItems;
    }
*/

    @wire(CurrentPageReference) pageRef;
    
    handleOrderSelected(orderId){
        console.log(`Handling Order Selected for OrderId: ${orderId}`);
        console.log(orderId);
        try {
            getOrderDetails(orderId)
                .then(order => {
                    console.log('Order Lookup: Success!')
                    console.log(order);
                    this._order = order;
                })
                .catch(error => {
                    console.error(`Error encountered when looking up Order Details`, error)
                })
        } catch(error) {
            console.error(`Error encountered when looking up Order Details`, error)
        }
    }

    updateOrderPricebook(orderId, pricebookId){
        console.log("updatingOrderPriceBook");
        return new Promise((resolve,reject) => {
            const fields = {};
            fields[ORDER_ID.fieldApiName] = orderId;
            fields[ORDER_PRICEBOOK2_ID.fieldApiName] = pricebookId;
            const recordInput = { fields };
            updateRecord(recordInput)
                .then(order => {
                    console.log('Updated Order with Pricebook Success');
                    this._order = order;
                    resolve(order);
                })
                .catch(error => {
                    console.error(`Error encountered when looking up Order Details`, error)
                    reject(error);
                });
        });

    }

    alterOrderItem(orderItemId,newQuantity){
        return new Promise((resolve,reject) =>{
            const fields = {};
            fields[ORDER_ITEM_ID.fieldApiName] = orderItemId;
            fields[ORDER_ITEM_QUANTITY.fieldApiName] = newQuantity;
            const recordInput = { fields };
            updateRecord(recordInput)
                .then(orderItem => {
                    resolve(orderItem);
                })
                .catch(error => {
                    console.error(`Error encountered when updating up Order Details`, error)
                    reject(error);
                });
        });
    }

    insertOrderItem(orderId, productId, pricebookEntryId, quantity, unitPrice){
        console.log(`Creating OrderItem: orderId:${orderId}, productId:${productId},pricebookEntryId:${pricebookEntryId}, quantity:${quantity}, unitPrice:${unitPrice}`);
        const fields = {};
        fields[ORDER_ITEM_ORDER_ID.fieldApiName] = orderId;
     //   fields[ORDER_ITEM_PRODUCT2_ID] = productId;
        fields[ORDER_ITEM_PRICEBOOK_ENTRY_ID.fieldApiName] = pricebookEntryId;
        fields[ORDER_ITEM_QUANTITY.fieldApiName] = quantity;
        fields[ORDER_ITEM_UNIT_PRICE.fieldApiName] = unitPrice;
        

        //ORDER_ITEM_UNIT_PRICE
        const recordInput = {
            apiName: ORDER_ITEM_OBJECT.objectApiName,
            fields
        };
        createRecord(recordInput)
            .then(orderItem =>{
                console.log("Order Item Created!",orderItem);
                this.handleOrderSelected({orderId: orderId});
            })
            .catch((e) => {
                console.error(`Error when attempting to create an order item`, e);
            });
    }

    

    handlePricebookEntrySelected(event){
        var pricebookEntryId = event.pricebookEntryId;
        var pricebookId = event.pricebookId;
        var productId =  event.productId;
        var price = event.price;
        try {
            console.log("Got OrderItems?")
            console.log(this._order.OrderItems);
            if(typeof this._order.OrderItems !== 'undefined' && this._order.OrderItems.length > 0 ){
                try {
                    console.log("Order Items Exist")
                    console.log(this._order.OrderItems);
                    var match = this._order.OrderItems.find(item => item.PricebookEntryId === pricebookEntryId);
                    if(typeof match !== 'undefined'){
                        var quantity = match.Quantity;
                        console.log(`Original Quantity ${quantity}`);
                        var newQuantity = quantity+1;
                        console.log(`New Quantity ${newQuantity}`);
                        this.alterOrderItem(match.Id, newQuantity).then(() => {
                            this.handleOrderSelected({orderId: this._order.Id});
                        })
                    }else{
                        console.log("inserting another");
                        this.insertOrderItem(
                            this._order.Id,
                            productId,
                            pricebookEntryId,
                            1,
                            price
                            )
                    }
                } catch (error) {
                    console.error("err when adding another", error)
                }
                
                
                
                
            }else{
                console.log("no order items");
                try {
                    this.updateOrderPricebook(this._order.Id,pricebookId).then(
                        this.insertOrderItem(
                            this._order.Id,
                            productId,
                            pricebookEntryId,
                            1,
                            price
                            )
                    )
                } catch (error) {
                    console.error('some errr',error);
                }
                
                
            }
            
            //look up proudct based on pricebook entry
            //add t
        } catch (error) {
            
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

            if(typeof this._order.OrderItems !== 'undefined' && this._order.OrderItems.length > 0 ){
                var match = this._order.OrderItems.find(item => item.Id === event.detail);
                if(typeof match !== 'undefined'){
                    if(match.Quantity === 1){
                        deleteRecord(event.detail).then(() => {
                            console.log("Record Deleted");
                            this.handleOrderSelected({orderId: this._order.Id});
                        }).catch(error => {
                            console.error('Error deleting item', error);
                        });
                    }else{
                        this.alterOrderItem(match.Id, match.Quantity-1).then(() =>{
                            this.handleOrderSelected({orderId: this._order.Id});
                        })
                    }
                }
            }

            /*

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
            */
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
        registerListener('pricebookEntrySelected', this.handlePricebookEntrySelected, this);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    
}