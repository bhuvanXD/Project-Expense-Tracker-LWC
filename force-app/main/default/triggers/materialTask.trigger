// trigger materialTask on Expense__c(before update, before insert)
// {

// 	for(Expense__c e: Trigger.new)
// 	{

// 		if(e.Expense_Amount__c<5000 && e.Expense_Type__c=='Material')
// 		{
// 		e.Approved__c= true;
// 		}

// 		else
// 		{
// 		e.Approved__c= false;
// 		}
// 	}

// }

trigger materialTask on Expense__c (before insert, before update) {
    for (Expense__c e : Trigger.new) {
        if (e.Expense_Amount__c < 5000 && e.Expense_Type__c == 'Material') {
            
            if (Trigger.isInsert || !Trigger.oldMap.get(e.Id).Approved__c) {
                e.Approved__c = true;
            }
        }
    }
}
