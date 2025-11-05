import { LightningElement, wire } from 'lwc';
import getAllProjects from '@salesforce/apex/ProjectExpenseController.getAllProjects';
import getExpensesByProject from '@salesforce/apex/ProjectExpenseController.getExpensesByProject';
import approveExpense from '@salesforce/apex/ProjectExpenseController.approveExpense';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import hasCustomPermission from '@salesforce/customPermission/Can_View_Special_Button';

export default class ProjectExpenseDashboard extends LightningElement {
    projects;
    error;
    expandedProjectId = null;
    expensesMap = {};   // stores expenses by project
    searchKey = '';
    hasPermission = hasCustomPermission; // ✅ Boolean value for permission

    columns = [
        {
            label: 'Project Name',
            type: 'button',
            fieldName: 'Name',
            typeAttributes: {
                label: { fieldName: 'Name' },
                name: 'view_project',
                variant: 'base'
            }
        },
        { label: 'Project Manager', fieldName: 'managerName' },
        { label: 'Budget', fieldName: 'Budget', type: 'currency' },
        { label: 'Total Expenses', fieldName: 'Total_Expenses', type: 'currency' },
        { label: 'Budget Percent', fieldName: 'BudgetUsedPercent', type: 'progressBar' },
        { label: 'Status', fieldName: 'Status' }
    ];

    expenseColumns = [];

    // ✅ Dynamically add Approve button only if permission is true
    connectedCallback() {
        this.expenseColumns = [
            { label: 'Name', fieldName: 'Name' },
            { label: 'Amount', fieldName: 'Expense_Amount__c', type: 'currency' },
            { label: 'Date', fieldName: 'Expense_Date__c', type: 'date' },
            { label: 'Type', fieldName: 'Expense_Type__c' },
            { label: 'Project Name', fieldName: 'projectName' },
            { label: 'Approved', fieldName: 'Approved__c', type: 'boolean' }
        ];

        if (this.hasPermission) {
            this.expenseColumns.push({
                label: 'Approve or Not',
                type: 'button',
                typeAttributes: {
                    label: 'Approve',
                    name: 'approve_expense',
                    variant: 'brand',
                    disabled: { fieldName: 'Approved__c' } 
                }
            });
        }
    }

    @wire(getAllProjects)
    wiredProjects({ error, data }) {
        if (data) {
            this.projects = data;
            this.error = undefined;
        } else {
            this.error = error;
            this.projects = undefined;
        }
    }

    handleRowAction(event) {
        const { action, row } = event.detail;

        if (action.name === 'view_project') {
            this.toggleExpenses(row.Id);
        }

        if (action.name === 'approve_expense') {
            this.approve(row.Id);
        }
    }

    toggleExpenses(projectId) {
        if (this.expandedProjectId === projectId) {
            this.expandedProjectId = null;
            return;
        }

        this.expandedProjectId = projectId;

        if (!this.expensesMap[projectId]) {
            getExpensesByProject({ projectId })
                .then(result => {
                    const projectName = result?.[0]?.Project__r?.Name || '';

                    const expensesWithProjectName = result.map(exp => ({
                        ...exp,
                        projectName
                    }));

                    this.expensesMap = { ...this.expensesMap, [projectId]: expensesWithProjectName };

                    console.log('Project:', projectName);
                    console.log('Expenses:', expensesWithProjectName);
                })
                .catch(error => {
                    this.error = error;
                });
        }
    }

    approve(expenseId) {
        approveExpense({ expenseId })
            .then(() => {
                const toastEvent = new ShowToastEvent({
                    title: 'Success',
                    message: 'Expense approved successfully',
                    variant: 'success'
                });
                this.dispatchEvent(toastEvent);
            })
            .catch(error => {
                const toastEvent = new ShowToastEvent({
                    title: 'Error',
                    message: error.body?.message || 'Error approving expense',
                    variant: 'error'
                });
                this.dispatchEvent(toastEvent);
            });
    }

    get expandedExpenses() {
        return this.expensesMap[this.expandedProjectId] || [];
    }

    get filteredProjects() {
        return this.projects?.filter(p =>
            p.Name?.toLowerCase().includes(this.searchKey.toLowerCase())
        ) || [];
    }

    handleSearch(e) {
        this.searchKey = e.target.value;
    }
}
