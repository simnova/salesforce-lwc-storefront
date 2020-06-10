import Id from '@salesforce/user/Id';

const determinePrice = (product) => {
    // lookup current userID
    var userId = Id;
    console.log(`Your UserID Is: ${userId}`);

    var defaultPrice = 0;
    var customPrice = 0;
    var userPrice = 0;

    // Find Custom and Default Prices
    for(var i = 0; i< product.PricebookEntries.length; i++){
        if(product.PricebookEntries[i].Pricebook2.IsStandard == true){
            defaultPrice = product.PricebookEntries[i].UnitPrice;
        }
        if(product.PricebookEntries[i].Pricebook2.Name.includes("Custom")){
            customPrice = product.PricebookEntries[i].UnitPrice;
        }
    }

    // Determine what price the user should see
    if(customPrice > 0){
        userPrice = customPrice;
    }else{
        userPrice = defaultPrice;
    }

    return userPrice;
}

export {
    determinePrice
}