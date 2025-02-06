// Model: Handles data interactions with Xrm.WebApi
class QuoteModel {
    static getQuote(quoteInfo) {
        const fetchXml = `<fetch>...</fetch>`; // Fetch XML Query (shortened for brevity)
        return parent.Xrm.WebApi.retrieveMultipleRecords("quote", `?fetchXml=${encodeURIComponent(fetchXml)}`)
            .then(results => results.entities)
            .catch(error => { console.error(error); throw error; });
    }
    
    static updateQuote(isTemplate, quoteId) {
        const requests = [this.quoteUpdateRequest(isTemplate, quoteId)];
        return parent.Xrm.WebApi.online.executeMultiple(requests)
            .then(response => response)
            .catch(error => { console.error(error); throw error; });
    }
    
    static saveNewQuote(isTemplate, quoteData) {
        return parent.Xrm.WebApi.createRecord("quote", quoteData)
            .then(result => result.id)
            .catch(error => { console.error(error); throw error; });
    }
    
    static deleteQuote(quoteId) {
        return parent.Xrm.WebApi.deleteRecord("quote", quoteId)
            .then(() => true)
            .catch(error => { console.error(error); throw error; });
    }
    
    static getUnits() {
        return parent.Xrm.WebApi.retrieveMultipleRecords("uom", "?$select=uomid,name,_uomscheduleid_value")
            .then(results => results.entities)
            .catch(error => { console.error(error); throw error; });
    }
    
    static saveCustomLine(customLines) {
        if (customLines.length === 0) return Promise.resolve("Empty");
        const createRequests = customLines.map(product => ({
            etn: "product",
            payload: this.formatCustomLine(product),
            getMetadata: () => ({ operationType: 2, operationName: "Create" })
        }));
        return parent.Xrm.WebApi.online.executeMultiple(createRequests)
            .then(response => response)
            .catch(error => { console.error(error); throw error; });
    }
    
    static formatCustomLine(product) {
        return {
            name: product.name,
            "defaultuomid@odata.bind": `/uoms(${product.defaultuomid.uomid})`,
            "defaultuomscheduleid@odata.bind": `/uomschedules(${product.defaultuomid.scheduleid})`,
            davinci_purchaseunitcost: Number(parseFloat(product.davinci_purchaseunitcost)),
            statecode: 0
        };
    }
}

export default QuoteModel;
