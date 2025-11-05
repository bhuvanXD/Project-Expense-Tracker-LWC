public with sharing class ProjectExpenseController {

    public class ProjectRow {
        @AuraEnabled public Id Id;
        @AuraEnabled public String Name;
        @AuraEnabled public String managerName;
        @AuraEnabled public Decimal Budget;
        @AuraEnabled public Decimal Total_Expenses;
        @AuraEnabled public Decimal BudgetUsedPercent;
        @AuraEnabled public String Status;
    }

    @AuraEnabled(cacheable=true)
    public static List<ProjectRow> getAllProjects() {
        List<Project__c> projects = [
            SELECT Id, Name, Project_Manager__r.Name,
                   Budget__c, Total_Expenses__c, Budget_Used_Percent__c,
                   Status__c
            FROM Project__c
        ];

        List<ProjectRow> rows = new List<ProjectRow>();

        for (Project__c p : projects) {
            ProjectRow r = new ProjectRow();
            r.Id = p.Id;
            r.Name = p.Name;
            r.managerName = p.Project_Manager__r != null ? p.Project_Manager__r.Name : '';
            r.Budget = p.Budget__c;
            r.Total_Expenses = p.Total_Expenses__c;
            r.BudgetUsedPercent = p.Budget_Used_Percent__c;
            r.Status = p.Status__c;
            rows.add(r);
        }
        return rows;
    }

    @AuraEnabled(cacheable=true)
public static List<Expense__c> getExpensesByProject(Id projectId) {
    return [
        SELECT Id, Name, Expense_Amount__c, Expense_Date__c,
               Expense_Type__c, Project__r.Name, Approved__c
        FROM Expense__c
        WHERE Project__c = :projectId
    ];
}

    @AuraEnabled
    public static void approveExpense(Id expenseId) {
        Expense__c exp = [
            SELECT Id, Approved__c
            FROM Expense__c
            WHERE Id = :expenseId LIMIT 1
        ];
        exp.Approved__c = true;
        update exp;
    }
}
