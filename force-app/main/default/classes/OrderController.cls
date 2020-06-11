public with sharing class OrderController {
    
    @AuraEnabled()
    public static Order getOrderDetails(Id orderId) {
        return [
            SELECT 
                o.Id, 
                o.Name, 
                o.AccountId, 
                o.TotalAmount, 
                o.Status, 
                (
                    SELECT 
                        Id, 
                        UnitPrice, 
                        Quantity, 
                        OrderId,
                        PricebookEntryId,
                        Product2.Name,
                        TotalPrice
                    FROM OrderItems
                ) 
            FROM Order o
            WHERE o.Id =: orderId
            WITH SECURITY_ENFORCED
            LIMIT 1 
        ];
    }


    @AuraEnabled(Cacheable=true)
    public static Order[] getAllOrders() {
        return [
            SELECT 
                Id, 
                Name, 
                OwnerId, 
                AccountId, 
                TotalAmount, 
                Status
            FROM Order
            WITH SECURITY_ENFORCED   
        ];
    }
   

}