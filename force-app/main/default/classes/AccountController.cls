public with sharing class AccountController {

    @AuraEnabled(Cacheable=true)
    public static Account[] getAccountByName() {
        String accountName = 'communityUserAccount%';
        return [
            SELECT 
                a.Id, 
                a.Name
            FROM Account a
            WHERE a.Name LIKE :accountName
            WITH SECURITY_ENFORCED   
        ];
    }

}
//        WHERE a.Name =: accountName
//String accountName