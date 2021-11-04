from flask import Flask, render_template, request
import datetime, time
import generate
import win32com.client as win32
import os

from generate import blast_templates, direct_templates, other_templates
from settings import gainsightInboundAddress, myEmail, signature

# INITIALIZE APP
app = Flask (__name__)
start = int(time.time())
log = []
counts = {'Blasts':0, 'Directs':0, 'Leads':0}
log.insert(0, 'App started')

def expand_product_name(product: str) -> str:
        '''
        Expands product name so user can enter a shorter version to save time
        Compares user input to dictionary key:value to find match, else returns user input
        '''
        products={
                'ADM':'Application Delivery Management',
                'WORKSPACE':'Workspace',
                'WKSP':'Workspace',
                'WSPP':'Workspace',
                'CCC':'Content Collaboration',
                'SF':'ShareFile',
                'CEM':'Endpoint Management',
                'CVAD':'Virtual Apps and Desktops',
                'CVA':'Virtual Apps',
        }
        return products.get(product.upper(), product.title())

def proper(name: str) -> str:
    '''
    The title() method will cause issues with suffixes like LP, INC, LLC.
    Split customer name up into individual words, check last word against dictionary of values and correct it.
    '''
    suffixes={
        'lp':'LP',
        'llp':'LLP',
        'l.l.p.':'L.L.P.',
        'inc':'INC.',
        'inc.':'INC.',
        'co.':'CO.',
        'co':'CO.',
        'pc':'PC',
        'us':'US',
        'usa':'USA',
        'llc':'LLC',
        'llc.':'LLC.',
        'ltd':'LTD',
        'ltd.':'LTD.'
    }
    
    split_name = name.split(' ')
    split_name[-1] = suffixes.get(split_name[-1].lower(), split_name[-1])

    return ' '.join(split_name)


def contacts_check(contacts: str) -> str:
        '''
        Sometimes the JS algorithm will pick up an '@citrix.com' email address that is on the SFDC contacts page
        We want convert the contats string to a list and check each item if it contains this substring and then remove it
        Yes I know that for the email blast function, I'm joining the received list only to split it immediately
        '''
        filtered_contacts = list(filter(lambda email: '@citrix.com' not in email, contacts.split('; ')))
        formatted_contacts = [email + ';' for email in filtered_contacts if len(email) > 0]
        return ' '.join(formatted_contacts)

class Customer:
        '''
        Customer object. Requires 7 kwargs; some of which are not needed for one method, but needed for others
        Has 3 methods; all variations of emailing somebody

        Pulling which function to use to generate the template. If/elif/else is too messy
        '''
        Templates = {
                'blast_intro':blast_templates.intro,
                'direct_intro':direct_templates.intro,
                'blast_checkin':blast_templates.checkin,
                'direct_checkin':direct_templates.checkin,
                'blast_admin_workshop':blast_templates.admin_workshop,
                'direct_admin_workshop':direct_templates.admin_workshop,
                'blast_arch_and_strat':blast_templates.arch_and_strat,
                'direct_arch_and_strat':direct_templates.arch_and_strat,
                'blast_read_review':blast_templates.read_review,
                'direct_read_review':direct_templates.read_review,
                'blast_renewal':blast_templates.renewal,
                'direct_renewal':direct_templates.renewal,
                'blast_custom':blast_templates.custom,
                'direct_custom':direct_templates.custom
        }

        def __init__(self, name, product=None, contact=None, directname=None, account_owner=None, comment=None, url=None):
                self.name = proper(name)
                self.product = expand_product_name(product)
                self.contact = contacts_check(contact)
                self.directname = directname
                self.account_owner = account_owner
                self.comment = comment
                self.url = url
        
        def email_blast(self, template_type):
                '''
                Send email to self, BCC all recipients
                '''
                subject, body = self.Templates.get(template_type)(self.name, self.product, signature)

                self._send_email(myEmail, self.contact + gainsightInboundAddress, subject, body)

                log.insert(0, f'Email blast for {self.Templates.get(template_type).__name__.title()} sent to {self.name} about {self.product}')

        def direct_email(self, template_type):
                '''
                Standard email to singular recipient
                '''
                subject, body = self.Templates.get(template_type)(self.name, self.product, self.directname, signature)

                self._send_email(self.contact, gainsightInboundAddress, subject, body)

                log.insert(0, f'Direct email for {self.Templates.get(template_type).__name__.title()} sent to {self.name} about {self.product}')
        
        def lead_notify(self):
                '''
                Send notification email to account owner on creation of lead
                '''
                subject, body = generate.other_templates.lead(self.name, self.account_owner, self.comment, self.url, signature)

                self._send_email('', '', subject, body)

                log.insert(0, f'Lead submitted for {self.name} due to {self.comment}. <a href="{self.url}">Link to lead</a>')

        def _send_email(self, recipient, bcc, subject, body):
                '''
                Using py win32 module to connect to Outlook on Windows. Creates a new message instance and input values
                Argument order: To, BCC, Subject, Body
                '''
                try:
                        app = win32.gencache.EnsureDispatch("outlook.Application")

                        msg = app.CreateItem(0)
                        msg.To = recipient
                        msg.BCC = bcc
                        msg.Subject = subject
                        msg.HTMLBody = body
                        msg.Display()
                except:
                        log.insert(0, f'ERROR: Cannot connect to Outlook due to bug in win32 python module')
                        log.insert(0, f'ERROR: Please run powershell command: Remove-Item -path $env:LOCALAPPDATA\Temp\gen_py -recurse')
                        log.insert(0, f'ERROR: Please shutdown app and restart by running command: python3 app.py')

                        raise Exception(f'\nFailed due to error in win32.com python module. You\'ll need to delete a directory to fix this. Please run the following command in powershell then restart the app.py script: \n\nRemove-Item -path $env:LOCALAPPDATA\Temp\gen_py -recurse\n\n')

# ROUTES
@app.route('/')
@app.route('/index')
def index():
        '''
        Default index page
        '''
        delta = ( int(time.time()) - start)
        uptime = str(datetime.timedelta(seconds=delta))

        # Count instances of log entries for our summary section
        counts['Blasts'] = len(list(filter(lambda i: 'blast' in i, log))) or 0
        counts['Directs'] = len(list(filter(lambda i: 'Direct' in i, log))) or 0
        counts['Leads'] = len(list(filter(lambda i: 'Lead' in i, log))) or 0

        return render_template('index.html', Counts = counts, Uptime = uptime, Log = log)


@app.route('/blastMethod', methods=['POST'])
def blastMethod():
        '''
        Receives data from browser bookmarklet. Pops list items off as customer object attributes
        Data received in format: {'payload' : [ contact1, contact2, contactN, ... , product, customer name, template type]}
        Creates temporary instance of customer class and calls email_blast method
        '''
        data = None
        if request.method == 'POST':
                try:
                        data = request.get_json(force=True)['payload']
                except:
                        print(f'''
                                ERROR! Please check how data is being sent and received
                                Data type: {type(data)}
                                Data: {data}
                        ''')
                        return

                template = data.pop()
                new_customer = Customer(data.pop(), product=data.pop().title(), contact='; '.join(data))
                new_customer.email_blast(template)
                del new_customer

        return 'OK'

@app.route('/directMethod', methods=['POST'])
def directMethod():
        '''
        Receives data from browser bookmarklet. Pops list items off as customer object attributes
        Data received in format: {'payload' : [ direct email contact, first name, product, customer name, template type]}
        Creates temporary instance of customer class and calls email_blast method
        '''
        data = None
        if request.method == 'POST':
                try:
                        data = request.get_json(force=True)['payload']
                except:
                        print(f'''
                                ERROR! Please check how data is being sent and received
                                Data type: {type(data)}
                                Data: {data}
                        ''')
                        return

                template = data.pop()
                new_customer = Customer(data.pop(), product=data.pop().title(), directname=data.pop().title(), contact=data.pop())
                new_customer.direct_email(template)
                del new_customer

        return 'OK'

@app.route('/leadnotify', methods=['GET', 'POST'])
def leadnotify():
        '''
        Receives data from browser bookmarklet. Pops list items off as customer object attributes
        Data received in format: {'payload' : [ account owner name, customer name, subject (of lead), url to lead ]}
        Creates temporary instance of customer class and calls lead_notify method
        '''
        data = None
        if request.method == 'POST':
                try:
                        data = request.get_json(force=True)['payload']
                except:
                        print(f'''
                                ERROR! Please check how data is being sent and received
                                Data type: {type(data)}
                                Data: {data}
                        ''')
                        return

                # Putting product & contact as 'dummy' to prevent issues with the functions called on attributes when Customer class is initialized. Default value of 'None' causes issues
                new_customer = Customer(url=data.pop(), comment=data.pop(), name=data.pop(), account_owner=data.pop(), product='dummy', contact='dummy')
                new_customer.lead_notify()
                del new_customer

        return 'OK'

@app.route('/quit', methods=['POST'])
def _quit():
        if request.method == 'POST':
                os._exit(0)
        return 'OK'

# START APP
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)