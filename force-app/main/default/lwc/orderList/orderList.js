import { LightningElement, track, wire} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import getAllOrders from '@salesforce/apex/OrderController.getAllOrders';
import getAccountByName from '@salesforce/apex/AccountController.getAccountByName';
import { createRecord } from 'lightning/uiRecordApi';
import Id from '@salesforce/user/Id';
import { fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';



//Order Schema
import ORDER_OBJECT from '@salesforce/schema/Order';
import ORDER_NAME from '@salesforce/schema/Order.Name';
import ORDER_ACCOUNT_ID from '@salesforce/schema/Order.AccountId';
import ORDER_CREATED_BY_ID from '@salesforce/schema/Order.CreatedById';
import ORDER_LAST_MODIFIED_BY_ID from '@salesforce/schema/Order.LastModifiedById';
import ORDER_TOTAL_AMOUNT from '@salesforce/schema/Order.TotalAmount';
import ORDER_NUMBER from '@salesforce/schema/Order.OrderNumber';
import ORDER_OWNER_ID from '@salesforce/schema/Order.OwnerId';
import ORDER_EFFECTIVE_DATE from '@salesforce/schema/Order.EffectiveDate';
import ORDER_STATUS from '@salesforce/schema/Order.Status';

//Account Schema
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import ACCOUNT_NAME from '@salesforce/schema/Account.Name';
import ACCOUNT_OWNER_ID from '@salesforce/schema/Account.OwnerId';

export default class OrderList extends LightningElement {

    @track _orderItems = [];
 
    /*
    get orderOptions() {
        return this._orderItems;
    }\
    */

    _selectedOrderId = null;
    _orderName = null;

    @wire(CurrentPageReference) pageRef;

    createAccount(accountName,ownerId) {
        return new Promise((resolve,reject) => {
            const fields = {};
            fields[ACCOUNT_NAME.fieldApiName] = accountName;
            fields[ACCOUNT_OWNER_ID.fieldApiName] = ownerId;
    
            const recordInput = { apiName: ACCOUNT_OBJECT.objectApiName, fields };
            createRecord(recordInput)
                .then(account => {
                    this.accountId = account.id;
                    console.log(`Account ID: ${account.id}`)
                    resolve(account.id);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
    
    handleChange(event){
        switch(event.target.dataset.id){
            case "orderList":
                this._selectedOrderId = event.detail.value;
                fireEvent(this.pageRef, 'orderSelected', {orderId: this._selectedOrderId}); // Dispatch Event so Shopping Cart can load this order
                break;
            case "orderName":
                this._orderName = event.detail.value;
                break;
            default:
                break;
        }
    }

    handleClick(event){
        try {
            console.log(`Creating Order: ${this._orderName}`);
            console.log(event);

            this.lookupOrCreateAccount('communityUserAccount',Id).then(accountId => {
                this.createOrder(this._orderName, accountId);
            });
        } catch (error) {
            console.error(`Error when creating Order: ${this._orderName}`, error);
        }
    }

    lookupOrCreateAccount(accountName,ownerId){
        console.log(`Creating Account : ${accountName} for OwnerId: ${ownerId}`);
        return new Promise((resolve,reject) => {
            getAccountByName().then(accounts => {
                console.log(`Account Results Returned `, accounts)
                if(accounts.length === 0){
                    return this.createAccount(accountName,ownerId)
                }else{
                    var accountId = accounts[0].Id;
                    console.log(`Account Lookup Successful, accountID: ${accountId}`);
                    resolve(accountId);
                }
            }).catch(e => {
                console.error("Issues when looking up account", e)
                reject(e);
            });
        });
    }

    createOrder(orderName, accountId){
        console.log(`Creating Order: Name:${orderName} AccountId:${accountId}`);
        const fields = {};


        fields[ORDER_NAME.fieldApiName] = orderName;
        fields[ORDER_ACCOUNT_ID.fieldApiName] = accountId; //"0014S000002HUexQAG";
        fields[ORDER_STATUS.fieldApiName] = "Draft";
       // fields[ORDER_CREATED_BY_ID.fieldApiName] = currentUserId;
       // fields[ORDER_LAST_MODIFIED_BY_ID.fieldApiName] = currentUserId;
       // fields[ORDER_TOTAL_AMOUNT.fieldApiName] = 0;
       // fields[ORDER_NUMBER.fieldApiName] = orderName;
        fields[ORDER_EFFECTIVE_DATE.fieldApiName] = new Date().toISOString();

        const recordInput = {
            apiName: ORDER_OBJECT.objectApiName,
            fields
        };
        createRecord(recordInput)
            .then(order => {
                console.log("Order Created!",order);
                try {
                    console.log(`Adding new order Item label: ${orderName} value:${order.id}`);
                    this._orderItems = [...this._orderItems, {label: orderName, value: order.id}];
                } catch (error) {
                    console.error(`Error when setting created order`, error);
                }
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: `Order Created with ID: ${order.id}`,
                        variant: 'success',
                    })
                );

                
                //this.loadOrders();
            })
            .catch((e) => {
                console.error(`Error when attempting to create an order`, e);
            });
    }

    loadOrders(){
        getAllOrders().then( orders => { 
            this._orderItems = orders.map(order => {return {label: order.Name, value: order.Id}});
        });
    }

    constructor(){
        super();
        this.loadOrders();
    }
}