var windowOptions = "height=800,width=800";
var url = "new_/quoting_tool/html/product_catalogue.html";

// Open the web resource
Xrm.Navigation.openWebResource(url, windowOptions);

function refreshPage() {
    
console.log(window.parent.location.href);
    // Refresh the page by reloading the current browser window
    window.parent.location.replace(window.parent.location.href);
}
refreshPage();
//OpenQuote!d1a7fd26e9e4461881e8a88e7ac4d3f1
