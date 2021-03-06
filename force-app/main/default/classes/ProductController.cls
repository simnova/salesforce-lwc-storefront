public with sharing class ProductController {
   
//WHERE Pricebook2.IsStandard=true
    @AuraEnabled(Cacheable=true)
    public static Product2[] getAllProducts() {
        return [
            SELECT 
                p.Id, 
                p.Description, 
                p.IsActive, 
                p.Name, 
                p.ProductCode, 
                (
                    SELECT 
                      Id,
                      Product2.Id,
                      UnitPrice,
                      PriceBook2.Name,
                      PriceBook2.IsStandard,
                      PriceBook2.Id
                    FROM  PricebookEntries
                ) 
                FROM   Product2 p
                WITH SECURITY_ENFORCED
        ];
    }

}