import LightningDatatable from 'lightning/datatable';
import progressBarTemplate from './progressBar.html';  


export default class CustomDatatableComp extends LightningDatatable {
    static customTypes = {
        progressBar: { 
            template: progressBarTemplate
        }
    };

}

//resources used:
//  https://developer.salesforce.com/docs/platform/lwc/guide/data-table-custom-types.html
//https://varasi.com/display-custom-data-type-in-salesforce-lightning-datatable/ 