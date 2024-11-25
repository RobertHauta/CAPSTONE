const products = [];
var table = document.getElementById("ProductTable");

parent.Xrm.WebApi.retrieveMultipleRecords("crmdqe_productsservices", "?$select=crmdqe_ourproductcode,davinci_laborminperunit").then(
    function success(result) {
        for(let i = 0; i < result.entities.length; i++){
            products[i] = [];
            products[i][0] = result.entities[i].crmdqe_ourproductcode;
            products[i][1] = result.entities[i].davinci_laborminperunit;

            var row = table.insertRow(1);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);
            var cell6 = row.insertCell(5);
            var cell7 = row.insertCell(6);
            
            cell1.innerHTML = products[i][0];
            cell2.innerHTML = products[i][1];
            cell3.innerHTML = "empty";
            cell4.innerHTML = "empty";
            cell5.innerHTML = "empty";
            cell6.innerHTML = "empty";
            cell7.innerHTML = "empty";
        }
        // perform operations on record retrieval
    },
    function (error) {
        prod.textContent = error.message;
        // handle error conditions
    }
    
);
