# email-automation
Why create a new tool for sending emails? Copying and pasting templates is too slow. Gainsight's built in email functionality is too limited and also too slow. This tool automates and speeds up much of the process without (hopefully) being too complicated to install.


### How it works
This tool consists of 2 separate pieces of software:

**Web Browser Extension**: Inserts buttons into the SalesForce page that the user can click on. The button onClick event scrapes the webpage for pertinent information, which is then formatted and POSTed to an API endpoint on a locally running server.

**Python Server**: Using Flask to expose several API endpoints. Each endpoint runs a function that utilizes the *pywin32* library to connect to Outlook for the purpose of sending auto-generated emails.

**TL;DR** This tool takes specific customer information from SalesForce and inputs into one of several email templates and sends it off with minimal user input, saving time.


### Available Email Templates
|        Type      | Mass Email  | Direct Email |
|------------------|-------------|--------------|
| Intro            | ✓           | ✓           |
| Checkin          | ✓           | ✓           |
| Admin Workshop   | ✓           | ✓           |
| Arch. & Strategy | ✓           | ✓           |
| Readiness Review | ✓           | ✓           |
| Renewal          | ✓           | ✓           |
| Custom           | ✓           | ✓           |

\+ Notifying account owner upon creation of a lead (Bookmarklet only, for use on newly created lead page)


### Current Compatibility
Windows ✓\
OSX ✗

| Extension | SFDC Classic | SFDC Lightning |
|-----------|--------------|----------------|
| Chrome    | ✓            | ✗             |
| Firefox   | ✗            | ✗             |
| Safari    | ✗            | ✗             |
| Edge      | ✗            | ✗             |

**Note**: Where the browser extension is not compatible, bookmarklets can be used as a fallback. Unless I am specifically asked to implement this, it will be put on standby.


### Pre-Requisites
1. Python 3.6+
2. Python pip
3. `pywin32` and `flask` Python packages

        $ python3 -m pip install pywin32
        $ python3 -m pip install Flask



### Installation
#### Downloading Files
1. Via terminal or command prompt

        $ git clone https://github.com/kaugm/email-automation
    
2. Via manual download by clicking on Code > Download ZIP\
2.a Extract ZIP archive and move folder to desired directory

#### Installing Browser Extension (Chrome)
1. In the browser, navigate to [chrome://extensions](chrome://extensions)
2. Ensure developer mode is turned on (toggle in top right corner)
3. Click on 'Load Unpacked' button in top left corner
4. Navigate to the folder that contains the browser extension: `../email-automation/chrome_extension/` and 'Select Folder'


### Configuration
1. Modify the file called `settings.py` in the root folder: `../email-automation/` with 5 variables, personalized to you:

        gainsightInboundAddress = 'exampleemailaddress@example.com;'
        myEmail = 'new.user@citrix.com'
        csm_full_name = 'Karl Martin'
        title = 'Customer Success Manager'
        address = '100 S West Street Raleigh, NC'

** For the signature variable you do not need to do anything. It should pull in whatever you set as name, title, and address to create a personalized signature. If you want to change the style of your signature, you'll need to custom code it using HTML.



### Personalization of Templates
#### Modifying Text
You can modify the email templates that you send to customers by editing the `blast_templates.py` and `direct_templates.py` files in the `../generate/` folder. Each template uses the following structure:

```
def TEMPLATE_NAME( INPUT_VARIABLES ):
        return( EMAIL_SUBJECT , EMAIL_BODY )
```

The formatting for the email subject and email body might look confusing, but everything inside the *f string* syntax (shown below) is what is included in the template to be sent:

```
f'''       TEXT HERE WILL BE USED AS TEXT IN THE EMAIL         '''
```

Dynamic variables included in these templates are wrapped in curly braces like `{variable}`. Note that only specific variables can be used, those that you include as arguments to the template function. When modifying a template, be sure to remember which specific variables are allowed. Below is an example:

```
def renewal_template(name, product):
        return (f'''Your Citrix Renewal''', 
        f'''Hello {name}! Your renewal for Citrix {product} is up for renewal..''')
```

Returns something like: "Hello Acme Co.! Your renewal of Citrix Virtual Apps and Desktops is up for renewal.."

#### Modifying formatting
The email templates are formatted using HTML, and as such you need to use this to change/add/remove formatting. The body portion of the email must always start off with `<html> <body>`. No need to close off these HTML elements within the template, as they closed off at the end of the signature, which *should* be included at the end of every email template. The only elements that you would need are:

        <strong> bold text </strong>
        <em> italicized text </em>
        <br>  → (line break)
        <br><br>  → (double line break)
        <a href=' link_to_somewhere '> link text </a>
        <ul>
          <li>bullet point</li>
          <li>bullet point</li>
        </ul>



### Initial Usage
1. Open up an instance of Command Prompt or Terminal
2. Navigate to the root directory `../email-automation/` (the one that contains the file `app.py`)
3. Run the command `python3 app.py`
4. Ensure browser extension is loaded

Optional: Navigate to http://localhost:5000/index to verify that the script is running and to see a dashboard with statistics and logs.



### Errors
In the case that there is any issue or error, check the Command Prompt, Terminal window, or the dashboard for any error descriptions or instructions.

*There is a small bug with the `pywin32` module that requires a directory to be deleted. If this happens, run the following commands in Powershell:

        $ Remove-Item -path $env:LOCALAPPDATA\Temp\gen_py -recurse
        $ exit




### Other Issues
##### Browser extension not compatible
Prelude. Bookmarklets can replace the browser extension functionality. They are JS code stored inside a bookmark, which runs when you click on the bookmark. Instead of having buttons inserted into the webpage, you can simply store all the necessary funtions in a folder on your bookmarks bar, and call the functions by clicking on a bookmarklet.\

1. For each JS file in the `../email-automation/static/bookmarklets/` folder [ TODO ]
2. Open up the JS file and copy everything
3. Use [bookmarklet creator website](https://mrcoles.com/bookmarklet/) or similar to prep the code
4. Copy the prepared code and create a new bookmark

        Name: Human readable name (Just copy the name of the JS file, they are named by what they do)
        URL: Pasted code

5. Save the bookmarklet