## Data Flow

How data flows through system. For someone looking to modify this

### Chrome Extension
1. Inserts Button
2. Button > onClick Event > Calls a function: function( method_type, template_type )

	method_type ( string ): '/blastMethod' or '/directMethod' -> associated API endpoint
	template_type ( string ): Arbitrary template names. Found in app.py > Customer.Templates

3. Function > Scrapes data from webpage and formats it in type 'list' > Sends to API endpoint of method_type at 'http://localhost:5000'

	Example payload: ['customer name', 'product', 'contact', ... , 'template type'] 


### Python Server
4. API endpoint > Runs function > Receives data of type 'list' > 'Pops' data off end of list and assigns to variables
5. Create Customer object instance with arguments of newly created variables > Customer object instance attributes
6. Call Customer object method ( Blast or Direct ) with 1x argument ( template_type )
7. Customer object method > Matches argument ( template_type ) against a dictionary of function names > Selects appropriate function
8. Run appropriate function > Generates email subject and body > stores in variables
9. Run email function with arguments: email subject, email body, recipient, and/or BCC
10. Delete Customer object instance