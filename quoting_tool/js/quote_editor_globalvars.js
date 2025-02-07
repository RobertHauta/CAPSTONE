/*
 * File Name: quote_editor_globalvars.js
 *
 * Description: This file contains all global variables used while on the quote_page.html file
 * this ensures visibility of these variables is allowed for all js files
 *
 * Created By:  Epic Dynamics Capstone Team
 *              Joshua Weir
 *              Robert Hauta
 *              Ernest Sarna
 *              Braden Foley
 *
 * This File is intended for use at Epic Commercial Roofing and Exteriors (Epic) and should not be outside of 
 * Epic's internal affairs
 */

$(document).ready(function() {
    parent.document.title = "Epic Roofing Quoting Tool";
});

//variable holding all line item json objects
var lineItems = [];
//line items that already exist in quote lines table associated with the current quote
var existingLineItems = [];
// Newly created products
var customLineItems = [];
//list of all availble units with their ids for creating new products
var units = [];
//lets certains parts of the code know if the quote has already been loaded into the web resource
var hasLoaded = true;
//parameter to check when leaving a page to see if its redirecting or exiting the quote manager
var redirect = false;
//Test Values will be dynamic in future
var QuoteId = "";
var LaborId = "";
var OpportunityId = "1bbcf3ef-e330-40ce-af4c-ed541dbe4c0f" //Testing Value will be integrated later
//varible to store information from the MDA form in order to query for the correct quote
var QuoteInfo = {};
//all the lines to be highlited from search
var highlightedLines = [];
//table rows
var rows = $("#QuoteTable tbody tr");
//last row index that was clicked on
var lastIndex = 0; 
//last search
var lastSearch = "";