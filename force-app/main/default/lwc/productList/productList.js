import { LightningElement, wire } from 'lwc';
import getAllProducts from '@salesforce/apex/ProductController.getAllProducts';
import { fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

export default class ProductList extends LightningElement {

    @wire(getAllProducts)products;
    @wire(CurrentPageReference) pageRef;

    handleProductSelected(event) {
        console.log('firing event');
        fireEvent(this.pageRef, 'productSelected', event.detail);
    }

}